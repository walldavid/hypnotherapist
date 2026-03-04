const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, `.env.${process.env.NODE_ENV || 'development'}`)
});

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const app = express();

// Import routes
const productRoutes = require('./routes/productRoutes');
const adminRoutes = require('./routes/adminRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const downloadRoutes = require('./routes/downloadRoutes');
const pageRoutes = require('./routes/pageRoutes');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');
const sanitizeMiddleware = require('./middleware/sanitize');

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "js.stripe.com", "www.paypal.com"],
      frameSrc: ["js.stripe.com", "www.paypal.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "*.stripe.com", "*.paypal.com"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// CORS Configuration
const isDev = process.env.NODE_ENV !== 'production';
const corsOptions = {
  origin: isDev
    ? ['http://localhost:3000', 'http://localhost:5173']
    : process.env.CLIENT_URL || false,
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Compression - Gzip responses
app.use(compression());

// Body parsing middleware with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data sanitization against NoSQL query injection
app.use(sanitizeMiddleware);

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});

const downloadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  message: 'Too many download requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const orderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Too many order requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general rate limit to all API routes
app.use('/api', apiLimiter);

// Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use('/api/products', productRoutes);
app.use('/api/admin/login', authLimiter);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderLimiter, orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/downloads', downloadLimiter, downloadRoutes);
app.use('/api/pages', pageRoutes);

// Serve React frontend in production; catch unmatched routes in dev
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.use('/api', notFound); // 404 for unmatched API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
} else {
  app.use(notFound);
}

app.use(errorHandler);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
