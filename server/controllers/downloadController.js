const Order = require('../models/Order');
const Product = require('../models/Product');

// Download file with token
exports.downloadFile = async (req, res, next) => {
  try {
    const { token } = req.params;

    // Find order with this download token
    const order = await Order.findOne({
      'downloads.downloadToken': token
    }).populate('downloads.product');

    if (!order) {
      return res.status(404).json({ error: 'Invalid download token' });
    }

    // Find the specific download
    const download = order.downloads.find(d => d.downloadToken === token);

    if (!download) {
      return res.status(404).json({ error: 'Download not found' });
    }

    // Check if token has expired
    if (new Date() > download.expiresAt) {
      return res.status(410).json({ error: 'Download link has expired' });
    }

    // Check download limit
    const product = await Product.findById(download.product);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (download.downloadCount >= product.downloadLimit) {
      return res.status(403).json({ error: 'Download limit exceeded' });
    }

    // Check if product has files
    if (!product.files || product.files.length === 0) {
      return res.status(404).json({ error: 'No files available for this product' });
    }

    // Update download count
    download.downloadCount += 1;
    download.lastDownloadedAt = new Date();
    await order.save();

    // Generate signed URLs for all files
    const gcsService = require('../services/gcsService');

    if (!gcsService.isConfigured()) {
      return res.status(503).json({ 
        error: 'File storage is not configured. Please contact support.' 
      });
    }

    try {
      const downloadLinks = await Promise.all(
        product.files.map(async (file) => {
          const signedUrl = await gcsService.getSignedUrl(file.gcsUrl, 1); // 1 hour expiry
          return {
            filename: file.originalName,
            size: file.fileSize,
            downloadUrl: signedUrl
          };
        })
      );

      res.json({
        message: 'Download links generated successfully',
        product: {
          id: product._id,
          name: product.name,
          category: product.category
        },
        files: downloadLinks,
        downloadCount: download.downloadCount,
        remainingDownloads: product.downloadLimit - download.downloadCount,
        expiresAt: download.expiresAt
      });
    } catch (error) {
      console.error('Error generating signed URLs:', error);
      return res.status(500).json({ 
        error: 'Failed to generate download links. Please try again later.' 
      });
    }
  } catch (error) {
    next(error);
  }
};

// Verify token without downloading
exports.verifyToken = async (req, res, next) => {
  try {
    const { token } = req.params;

    const order = await Order.findOne({
      'downloads.downloadToken': token
    }).populate('downloads.product');

    if (!order) {
      return res.status(404).json({ error: 'Invalid download token' });
    }

    const download = order.downloads.find(d => d.downloadToken === token);

    if (!download) {
      return res.status(404).json({ error: 'Download not found' });
    }

    const product = await Product.findById(download.product);

    res.json({
      valid: new Date() <= download.expiresAt,
      product: {
        id: product._id,
        name: product.name,
        category: product.category
      },
      downloadCount: download.downloadCount,
      remainingDownloads: product.downloadLimit - download.downloadCount,
      expiresAt: download.expiresAt
    });
  } catch (error) {
    next(error);
  }
};
