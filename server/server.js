const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
require('dotenv').config();

const app = express();

// Import routes
const productRoutes = require('./routes/productRoutes');
const adminRoutes = require('./routes/adminRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const downloadRoutes = require('./routes/downloadRoutes');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Security Middleware
// Helmet - Set security headers
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
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
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
app.use(mongoSanitize());

// Rate limiting
// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limit for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit for download endpoints
const downloadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 downloads per hour per IP
  message: 'Too many download requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit for order creation
const orderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 orders per hour per IP
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
app.use('/api/admin/login', authLimiter); // Apply auth limiter to login
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderLimiter, orderRoutes); // Apply order limiter
app.use('/api/payment', paymentRoutes);
app.use('/api/downloads', downloadLimiter, downloadRoutes); // Apply download limiter

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// MongoDB connection
const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI && process.env.NODE_ENV !== 'test') {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ MongoDB connected successfully');
    } else {
      console.log('⚠️  MongoDB URI not provided - running without database (development mode)');
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('⚠️  Server will continue without database connection');
  }
};

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
});

module.exports = app;
