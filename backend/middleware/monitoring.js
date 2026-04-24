const os = require('os');
const mongoose = require('mongoose');

// Performance monitoring middleware
const performanceMonitor = (req, res, next) => {
  // Skip monitoring for proxy endpoints to avoid header conflicts
  if (res.locals.skipMonitoring || req.originalUrl.includes('/proxy')) {
    return next();
  }

  const startTime = Date.now();
  
  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function(...args) {
    const responseTime = Date.now() - startTime;
    
    // Log slow requests (> 1 second)
    if (responseTime > 1000) {
      console.warn('🐌 Slow Request:', {
        url: req.originalUrl,
        responseTime: `${responseTime}ms`,
        statusCode: res.statusCode,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
    }

    // Add response time header only if headers haven't been sent
    if (!res.headersSent) {
      res.set('X-Response-Time', `${responseTime}ms`);
    }
    
    originalEnd.apply(this, args);
  };

  next();
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip;
  const userAgent = req.get('User-Agent');

  console.log(`📝 ${timestamp} - ${method} ${url} - ${ip} - ${userAgent}`);
  
  next();
};

// Health check endpoint data
const getHealthStatus = async () => {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    system: {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        system: Math.round(os.totalmem() / 1024 / 1024),
        free: Math.round(os.freemem() / 1024 / 1024)
      },
      cpu: {
        cores: os.cpus().length,
        load: os.loadavg()
      }
    },
    services: {}
  };

  // Check database connection
  try {
    if (mongoose.connection.readyState === 1) {
      healthData.services.database = {
        status: 'connected',
        name: mongoose.connection.name
      };
    } else {
      healthData.services.database = {
        status: 'disconnected'
      };
      healthData.status = 'degraded';
    }
  } catch (error) {
    healthData.services.database = {
      status: 'error',
      error: error.message
    };
    healthData.status = 'unhealthy';
  }

  // Check Cloudinary (if configured)
  if (process.env.CLOUDINARY_CLOUD_NAME) {
    healthData.services.cloudinary = {
      status: 'configured',
      cloudName: process.env.CLOUDINARY_CLOUD_NAME
    };
  }

  // Check email service (if configured)
  if (process.env.EMAIL_USER) {
    healthData.services.email = {
      status: 'configured',
      provider: 'gmail'
    };
  }

  return healthData;
};

// Metrics collection
let metrics = {
  requests: {
    total: 0,
    success: 0,
    errors: 0,
    byMethod: {},
    byStatus: {}
  },
  responseTime: {
    total: 0,
    count: 0,
    average: 0
  },
  errors: [],
  startTime: Date.now()
};

// Metrics middleware
const metricsCollector = (req, res, next) => {
  // Skip metrics for proxy endpoints to avoid conflicts
  if (res.locals.skipMonitoring || req.originalUrl.includes('/proxy')) {
    return next();
  }

  const startTime = Date.now();
  
  // Increment total requests
  metrics.requests.total++;
  
  // Track by method
  metrics.requests.byMethod[req.method] = (metrics.requests.byMethod[req.method] || 0) + 1;

  // Override res.end to capture metrics
  const originalEnd = res.end;
  res.end = function(...args) {
    const responseTime = Date.now() - startTime;
    
    // Update response time metrics
    metrics.responseTime.total += responseTime;
    metrics.responseTime.count++;
    metrics.responseTime.average = Math.round(metrics.responseTime.total / metrics.responseTime.count);
    
    // Track by status code
    metrics.requests.byStatus[res.statusCode] = (metrics.requests.byStatus[res.statusCode] || 0) + 1;
    
    // Track success/error
    if (res.statusCode >= 200 && res.statusCode < 400) {
      metrics.requests.success++;
    } else {
      metrics.requests.errors++;
      
      // Store recent errors (keep last 10)
      if (metrics.errors.length >= 10) {
        metrics.errors.shift();
      }
      
      metrics.errors.push({
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        responseTime,
        ip: req.ip
      });
    }
    
    originalEnd.apply(this, args);
  };

  next();
};

// Get metrics data
const getMetrics = () => {
  const uptime = Date.now() - metrics.startTime;
  
  return {
    ...metrics,
    uptime: Math.round(uptime / 1000), // in seconds
    requestsPerSecond: Math.round((metrics.requests.total / uptime) * 1000),
    errorRate: metrics.requests.total > 0 ? 
      Math.round((metrics.requests.errors / metrics.requests.total) * 100) : 0
  };
};

// Reset metrics (useful for testing)
const resetMetrics = () => {
  metrics = {
    requests: {
      total: 0,
      success: 0,
      errors: 0,
      byMethod: {},
      byStatus: {}
    },
    responseTime: {
      total: 0,
      count: 0,
      average: 0
    },
    errors: [],
    startTime: Date.now()
  };
};

// Memory usage monitoring
const monitorMemory = () => {
  const usage = process.memoryUsage();
  const threshold = 500 * 1024 * 1024; // 500MB threshold
  
  if (usage.heapUsed > threshold) {
    console.warn('⚠️ High memory usage detected:', {
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + 'MB',
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024) + 'MB',
      external: Math.round(usage.external / 1024 / 1024) + 'MB'
    });
  }
};

// Start memory monitoring (check every 30 seconds)
if (process.env.NODE_ENV === 'production') {
  setInterval(monitorMemory, 30000);
}

module.exports = {
  performanceMonitor,
  requestLogger,
  getHealthStatus,
  metricsCollector,
  getMetrics,
  resetMetrics
};