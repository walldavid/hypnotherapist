const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const productController = require('../controllers/productController');
const orderController = require('../controllers/orderController');
const { authenticateAdmin } = require('../middleware/auth');
const { uploadMultiple, uploadProductFiles, handleUploadError } = require('../middleware/upload');

// Admin authentication
router.post('/login', adminController.login);
router.post('/logout', authenticateAdmin, adminController.logout);
router.get('/me', authenticateAdmin, adminController.getCurrentAdmin);

// Product management
router.post('/products', authenticateAdmin, uploadProductFiles, handleUploadError, productController.createProduct);
router.put('/products/:id', authenticateAdmin, uploadProductFiles, handleUploadError, productController.updateProduct);
router.delete('/products/:id', authenticateAdmin, productController.deleteProduct);
router.post('/products/:id/upload', 
  authenticateAdmin, 
  uploadMultiple, 
  handleUploadError,
  productController.uploadProductFiles
);

// Order management
router.get('/orders', authenticateAdmin, orderController.getAllOrders);
router.get('/orders/:id', authenticateAdmin, orderController.getOrderById);
router.put('/orders/:id/status', authenticateAdmin, orderController.updateOrderStatus);

// Analytics
router.get('/analytics/dashboard', authenticateAdmin, adminController.getDashboardStats);

module.exports = router;
