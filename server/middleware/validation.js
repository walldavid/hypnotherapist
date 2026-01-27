const { body, param, query, validationResult } = require('express-validator');

// Middleware to check validation results
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Product validation rules
exports.productValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required')
    .isLength({ max: 200 }).withMessage('Name cannot exceed 200 characters'),
  body('description').trim().notEmpty().withMessage('Description is required')
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').isIn(['audio', 'course', 'pdf', 'video', 'bundle'])
    .withMessage('Invalid category'),
  body('status').optional().isIn(['active', 'inactive', 'draft'])
    .withMessage('Invalid status')
];

// Order validation rules
exports.orderValidation = [
  body('customerEmail').isEmail().normalizeEmail()
    .withMessage('Valid email is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.product').isMongoId().withMessage('Invalid product ID'),
  body('items.*.quantity').optional().isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('paymentMethod').isIn(['stripe', 'paypal'])
    .withMessage('Invalid payment method')
];

// Admin login validation
exports.loginValidation = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// Email validation
exports.emailValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
];

// ID parameter validation
exports.idValidation = [
  param('id').isMongoId().withMessage('Invalid ID format')
];
