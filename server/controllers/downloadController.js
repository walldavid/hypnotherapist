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
    if (download.downloadCount >= product.downloadLimit) {
      return res.status(403).json({ error: 'Download limit exceeded' });
    }

    // Update download count
    download.downloadCount += 1;
    download.lastDownloadedAt = new Date();
    await order.save();

    // TODO: Generate signed URL from Google Cloud Storage
    // This will be implemented in Phase 4
    // const gcsService = require('../services/gcsService');
    // const downloadUrl = await gcsService.getSignedUrl(product.files[0].gcsUrl);

    res.status(501).json({ 
      message: 'File download not yet implemented',
      product: product.name,
      downloadCount: download.downloadCount,
      remainingDownloads: product.downloadLimit - download.downloadCount
    });
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
