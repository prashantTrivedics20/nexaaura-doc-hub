const express = require('express');
const cors = require('cors');
const compression = require('compression');
const mongoose = require('mongoose');
require('dotenv').config();

// Import configurations and middleware
const { connectDB, setupDBMonitoring, setupBackupSchedule, setupIndexes } = require('./config/database');
const { 
  rateLimiters, 
  securityHeaders, 
  sanitizeInput, 
  requestLimits, 
  ipWhitelist, 
  securityLogger,
  corsOptions 
} = require('./middleware/security');
const { 
  globalErrorHandler, 
  notFoundHandler, 
  gracefulShutdown 
} = require('./middleware/errorHandler');
const { 
  performanceMonitor, 
  requestLogger, 
  getHealthStatus, 
  metricsCollector, 
  getMetrics 
} = require('./middleware/monitoring');

// Import routes
const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents');
const userRoutes = require('./routes/users');
const categoryRoutes = require('./routes/categories');
const paymentRoutes = require('./routes/payments');

const app = express();

// Trust proxy (important for production behind load balancer)
app.set('trust proxy', 1);

// Security middleware (apply early)
app.use(securityHeaders);
app.use(securityLogger);
app.use(ipWhitelist);

// CORS
app.use(cors(corsOptions));

// Compression middleware
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6,
  threshold: 1024
}));

// Monitoring middleware
app.use(performanceMonitor);
app.use(metricsCollector);

// Request logging (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(requestLogger);
}

// Rate limiting
app.use('/api/auth/send-otp', rateLimiters.otp);
app.use('/api/auth/verify-otp', rateLimiters.auth);
app.use('/api/auth/reset-password', rateLimiters.passwordReset);
app.use('/api/documents/upload', rateLimiters.upload);
app.use('/api', rateLimiters.general);

// Body parsing middleware with size limits
app.use(express.json(requestLimits.json));
app.use(express.urlencoded(requestLimits.urlencoded));

// Input sanitization
app.use(sanitizeInput);

// Health check endpoints
app.get('/health', async (req, res) => {
  try {
    const health = await getHealthStatus();
    const statusCode = health.status === 'healthy' ? 200 : 
                      health.status === 'degraded' ? 200 : 503;
    
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Metrics endpoint (protected)
app.get('/metrics', (req, res) => {
  // Simple authentication for metrics endpoint
  const token = req.headers.authorization;
  if (token !== `Bearer ${process.env.METRICS_TOKEN}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  res.json(getMetrics());
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/payments', paymentRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'NEXA-DOC-HUB API',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    docs: '/api/docs' // If you add API documentation
  });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(globalErrorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Setup database monitoring and indexes
    setupDBMonitoring();
    
    // Setup indexes after connection is established
    mongoose.connection.once('open', async () => {
      await setupIndexes();
    });
    
    // Setup backup schedule (production only)
    setupBackupSchedule();
    
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
      }
    });

    // Setup graceful shutdown
    gracefulShutdown(server);

    // Handle server errors
    server.on('error', (error) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

      switch (error.code) {
        case 'EACCES':
          console.error(`❌ ${bind} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error(`❌ ${bind} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app;