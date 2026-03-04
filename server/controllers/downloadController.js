const orders = require('../collections/orders');
const products = require('../collections/products');
const gcsService = require('../services/gcsService');

// Get download information (validates token and returns download details)
exports.getDownloadInfo = async (req, res, next) => {
  try {
    const { token } = req.params;

    const tokenDoc = await orders.getDownloadToken(token);
    if (!tokenDoc) {
      return res.status(404).json({ error: 'Invalid download token' });
    }

    if (new Date() > new Date(tokenDoc.expiresAt)) {
      return res.status(410).json({ error: 'Download link has expired' });
    }

    const product = await products.getById(tokenDoc.productId);
    if (!product || !product.files || product.files.length === 0) {
      return res.status(404).json({ error: 'No files available for this product' });
    }

    const order = await orders.getById(tokenDoc.orderId);

    res.json({
      orderNumber: order ? order.orderNumber : '',
      customerEmail: order ? order.customerEmail : '',
      productName: product.name,
      productId: product.id,
      downloadCount: tokenDoc.downloadCount,
      maxDownloads: tokenDoc.maxDownloads,
      expiresAt: tokenDoc.expiresAt,
      files: product.files.map(f => ({ originalName: f.originalName, size: f.fileSize })),
    });
  } catch (error) {
    next(error);
  }
};

// Download a specific file from the product
exports.downloadFile = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { fileIndex = 0 } = req.body;

    const tokenDoc = await orders.getDownloadToken(token);
    if (!tokenDoc) {
      return res.status(404).json({ error: 'Invalid download token' });
    }

    if (new Date() > new Date(tokenDoc.expiresAt)) {
      return res.status(410).json({ error: 'Download link has expired' });
    }

    if (tokenDoc.downloadCount >= tokenDoc.maxDownloads) {
      return res.status(403).json({ error: 'Download limit exceeded' });
    }

    const product = await products.getById(tokenDoc.productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (fileIndex < 0 || fileIndex >= product.files.length) {
      return res.status(400).json({ error: 'Invalid file index' });
    }

    if (!gcsService.isConfigured()) {
      return res.status(503).json({ error: 'File storage is not configured. Please contact support.' });
    }

    const file = product.files[fileIndex];

    try {
      const signedUrl = await gcsService.getSignedUrl(file.gcsUrl, 1); // 1-hour expiry

      await orders.updateDownloadToken(token, {
        downloadCount: tokenDoc.downloadCount + 1,
        lastDownloadedAt: new Date().toISOString(),
      });

      res.json({ signedUrl, filename: file.originalName, size: file.fileSize });
    } catch (err) {
      console.error('Error generating signed URL:', err);
      return res.status(500).json({ error: 'Failed to generate download link. Please try again later.' });
    }
  } catch (error) {
    next(error);
  }
};
