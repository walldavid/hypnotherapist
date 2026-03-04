const products = require('../collections/products');

// Get all products (public)
exports.getAllProducts = async (req, res, next) => {
  try {
    const { status = 'active', sort = '-createdAt', limit = 20, page = 1 } = req.query;
    const sortDir = sort.startsWith('-') ? 'desc' : 'asc';
    const result = await products.list({ status, page, limit, sort: sortDir });
    result.products = result.products.map(({ files, ...p }) => p);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Get product by ID (public)
exports.getProductById = async (req, res, next) => {
  try {
    const product = await products.getById(req.params.id);
    if (!product || product.status !== 'active') {
      return res.status(404).json({ error: 'Product not found' });
    }
    const { files, ...publicProduct } = product;
    res.json(publicProduct);
  } catch (error) {
    next(error);
  }
};

// Get products by category (public)
exports.getProductsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const { limit = 20, page = 1 } = req.query;
    const result = await products.list({ status: 'active', category, page, limit });
    result.products = result.products.map(({ files, ...p }) => p);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Search products (public)
exports.searchProducts = async (req, res, next) => {
  try {
    const { query } = req.params;
    const found = await products.search(query);
    res.json({ products: found.map(({ files, ...p }) => p) });
  } catch (error) {
    next(error);
  }
};

// Create product (admin only)
exports.createProduct = async (req, res, next) => {
  try {
    const productData = { ...req.body };

    if (req.body.features && typeof req.body.features === 'string') {
      try { productData.features = JSON.parse(req.body.features); }
      catch (e) { productData.features = req.body.features.split(',').map(f => f.trim()); }
    }

    if (req.body.tags && typeof req.body.tags === 'string') {
      try { productData.tags = JSON.parse(req.body.tags); }
      catch (e) { productData.tags = req.body.tags.split(',').map(t => t.trim()); }
    }

    if (req.files && req.files.images) {
      productData.images = await Promise.all(req.files.images.map(async (file, index) => {
        const base64 = file.buffer.toString('base64');
        return { url: `data:${file.mimetype};base64,${base64}`, alt: productData.name || 'Product image', isPrimary: index === 0 };
      }));
    }

    const product = await products.create(productData);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// Update product (admin only)
exports.updateProduct = async (req, res, next) => {
  try {
    const updateData = { ...req.body };

    if (req.body.features && typeof req.body.features === 'string') {
      try { updateData.features = JSON.parse(req.body.features); }
      catch (e) { updateData.features = req.body.features.split(',').map(f => f.trim()); }
    }

    if (req.body.tags && typeof req.body.tags === 'string') {
      try { updateData.tags = JSON.parse(req.body.tags); }
      catch (e) { updateData.tags = req.body.tags.split(',').map(t => t.trim()); }
    }

    if (req.files && req.files.images) {
      updateData.images = await Promise.all(req.files.images.map(async (file, index) => {
        const base64 = file.buffer.toString('base64');
        return { url: `data:${file.mimetype};base64,${base64}`, alt: updateData.name || 'Product image', isPrimary: index === 0 };
      }));
    }

    const product = await products.update(req.params.id, updateData);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
};

// Delete product (admin only)
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await products.getById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.files && product.files.length > 0) {
      const gcsService = require('../services/gcsService');
      if (gcsService.isConfigured()) {
        try {
          await gcsService.deleteFiles(product.files.map(f => f.gcsUrl));
        } catch (err) {
          console.error('Error deleting files from GCS:', err);
        }
      }
    }

    await products.remove(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Upload product files (admin only)
exports.uploadProductFiles = async (req, res, next) => {
  try {
    const product = await products.getById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const gcsService = require('../services/gcsService');
    if (!gcsService.isConfigured()) {
      return res.status(503).json({ error: 'File storage is not configured. Please set up Google Cloud Storage credentials.' });
    }

    const uploadedFiles = [];
    for (const file of req.files) {
      try {
        const fileData = await gcsService.uploadFile(file.buffer, file.originalname, file.mimetype);
        uploadedFiles.push(fileData);
      } catch (err) {
        console.error(`Error uploading file ${file.originalname}:`, err);
      }
    }

    if (uploadedFiles.length === 0) {
      return res.status(500).json({ error: 'Failed to upload any files' });
    }

    const updatedFiles = [...(product.files || []), ...uploadedFiles];
    const updated = await products.update(req.params.id, { files: updatedFiles });

    res.json({ message: `${uploadedFiles.length} file(s) uploaded successfully`, files: uploadedFiles, product: updated });
  } catch (error) {
    next(error);
  }
};
