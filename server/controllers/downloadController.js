const Order = require('../models/Order');
const Product = require('../models/Product');
const gcsService = require('../services/gcsService');

// Get download information (validates token and returns download details)
exports.getDownloadInfo = async (req, res, next) => {
  try {
    const { token } = req.params;

    // Find order with this download token
    const order = await Order.findOne({
      'downloads.token': token
    }).populate('items.product');

    if (!order) {
      return res.status(404).json({ error: 'Invalid download token' });
    }

    // Find the specific download
    const download = order.downloads.find(d => d.token === token);

    if (!download) {
      return res.status(404).json({ error: 'Download not found' });
    }

    // Check if token has expired
    if (new Date() > download.expiresAt) {
      return res.status(410).json({ error: 'Download link has expired' });
    }

    // Get product info
    const orderItem = order.items.find(item => 
      item.product._id.toString() === download.productId.toString()
    );

    if (!orderItem) {
      return res.status(404).json({ error: 'Product not found in order' });
    }

    const product = orderItem.product;

    // Check if product has files
    if (!product.files || product.files.length === 0) {
      return res.status(404).json({ error: 'No files available for this product' });
    }

    res.json({
      orderNumber: order.orderNumber,
      customerEmail: order.customerEmail,
      productName: product.name,
      productId: product._id,
      downloadCount: download.downloadCount,
      maxDownloads: download.maxDownloads,
      expiresAt: download.expiresAt,
      files: product.files.map(file => ({
        originalName: file.originalName,
        size: file.fileSize
      }))
    });
  } catch (error) {
    next(error);
  }
};

// Download a specific file from the product
exports.downloadFile = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { fileIndex } = req.body;

    // Find order with this download token
    const order = await Order.findOne({
      'downloads.token': token
    }).populate('items.product');

    if (!order) {
      return res.status(404).json({ error: 'Invalid download token' });
    }

    // Find the specific download
    const download = order.downloads.find(d => d.token === token);

    if (!download) {
      return res.status(404).json({ error: 'Download not found' });
    }

    // Check if token has expired
    if (new Date() > download.expiresAt) {
      return res.status(410).json({ error: 'Download link has expired' });
    }

    // Check download limit
    if (download.downloadCount >= download.maxDownloads) {
      return res.status(403).json({ error: 'Download limit exceeded' });
    }

    // Get product
    const orderItem = order.items.find(item => 
      item.product._id.toString() === download.productId.toString()
    );

    if (!orderItem) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = orderItem.product;

    // Check if file index is valid
    if (fileIndex < 0 || fileIndex >= product.files.length) {
      return res.status(400).json({ error: 'Invalid file index' });
    }

    const file = product.files[fileIndex];

    // Check if GCS is configured
    if (!gcsService.isConfigured()) {
      return res.status(503).json({ 
        error: 'File storage is not configured. Please contact support.' 
      });
    }

    // Generate signed URL
    try {
      const signedUrl = await gcsService.getSignedUrl(file.gcsUrl, 1); // 1 hour expiry

      // Update download count
      download.downloadCount += 1;
      download.lastDownloadedAt = new Date();
      await order.save();

      res.json({
        signedUrl,
        filename: file.originalName,
        size: file.fileSize
      });
    } catch (error) {
      console.error('Error generating signed URL:', error);
      return res.status(500).json({ 
        error: 'Failed to generate download link. Please try again later.' 
      });
    }
  } catch (error) {
    next(error);
  }
};
