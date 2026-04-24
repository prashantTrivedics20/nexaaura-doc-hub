const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

// Rate limiting configurations
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: message,
        retryAfter: Math.round(windowMs / 1000)
      });
    }
  });
};

// Different rate limits for different endpoints
const rateLimiters = {
  // General API rate limit
  general: createRateLimiter(
    15 * 60 * 1000, // 15 minutes
    100, // 100 requests per window
    'Too many requests from this IP, please try again later'
  ),

  // Strict rate limit for authentication endpoints
  auth: createRateLimiter(
    15 * 60 * 1000, // 15 minutes
    5, // 5 attempts per window
    'Too many authentication attempts, please try again later'
  ),

  // OTP rate limit
  otp: createRateLimiter(
    5 * 60 * 1000, // 5 minutes
    3, // 3 OTP requests per window
    'Too many OTP requests, please wait before requesting again'
  ),

  // File upload rate limit
  upload: createRateLimiter(
    60 * 60 * 1000, // 1 hour
    10, // 10 uploads per hour
    'Upload limit exceeded, please try again later'
  ),

  // Password reset rate limit
  passwordReset: createRateLimiter(
    60 * 60 * 1000, // 1 hour
    3, // 3 password reset attempts per hour
    'Too many password reset attempts, please try again later'
  )
};

// Security headers configuration
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://*.cloudinary.com"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.cloudinary.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Input sanitization middleware
const sanitizeInput = [
  mongoSanitize(), // Prevent NoSQL injection
  xss(), // Clean user input from malicious HTML
  hpp() // Prevent HTTP Parameter Pollution
];

// Request size limits
const requestLimits = {
  json: { limit: '10mb' },
  urlencoded: { limit: '10mb', extended: true },
  raw: { limit: '50mb' } // For file uploads
};

// IP whitelist for admin operations (optional)
const ipWhitelist = (req, res, next) => {
  const allowedIPs = process.env.ADMIN_ALLOWED_IPS?.split(',') || [];
  
  if (allowedIPs.length > 0 && req.path.startsWith('/api/admin')) {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    if (!allowedIPs.includes(clientIP)) {
      return res.status(403).json({
        error: 'Access denied from this IP address'
      });
    }
  }
  
  next();
};

// Security logging middleware
const securityLogger = (req, res, next) => {
  // Log suspicious activities
  const suspiciousPatterns = [
    /(\.\.|\/etc\/|\/proc\/|\/sys\/)/i, // Path traversal
    /(union|select|insert|delete|update|drop|create|alter)/i, // SQL injection
    /(<script|javascript:|vbscript:|onload|onerror)/i, // XSS attempts
    /(eval\(|setTimeout\(|setInterval\()/i // Code injection
  ];

  const userAgent = req.get('User-Agent') || '';
  const url = req.originalUrl || req.url;
  const body = JSON.stringify(req.body);

  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(url) || pattern.test(body) || pattern.test(userAgent)
  );

  if (isSuspicious) {
    console.warn('🚨 Suspicious request detected:', {
      ip: req.ip,
      userAgent,
      url,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  }

  next();
};

// CORS configuration for production
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'https://yourdomain.com',
      'https://www.yourdomain.com'
    ];

    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

module.exports = {
  rateLimiters,
  securityHeaders,
  sanitizeInput,
  requestLimits,
  ipWhitelist,
  securityLogger,
  corsOptions
};