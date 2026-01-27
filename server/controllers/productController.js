const Product = require('../models/Product');

// Get all products (public)
exports.getAllProducts = async (req, res, next) => {
  try {
    const { status = 'active', sort = '-createdAt', limit = 20, page = 1 } = req.query;

    const query = { status };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip)
      .select('-files'); // Don't expose file URLs publicly

    const total = await Product.countDocuments(query);

    res.json({
      products,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get product by ID (public)
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).select('-files');

    if (!product || product.status !== 'active') {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
};

// Get products by category (public)
exports.getProductsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const { limit = 20, page = 1 } = req.query;

    const products = await Product.find({ category, status: 'active' })
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select('-files');

    const total = await Product.countDocuments({ category, status: 'active' });

    res.json({
      products,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// Search products (public)
exports.searchProducts = async (req, res, next) => {
  try {
    const { query } = req.params;
    const { limit = 20, page = 1 } = req.query;

    const products = await Product.find({
      $text: { $search: query },
      status: 'active'
    })
      .sort({ score: { $meta: 'textScore' } })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select('-files');

    res.json({ products });
  } catch (error) {
    next(error);
  }
};

// Create product (admin only)
exports.createProduct = async (req, res, next) => {
  try {
    const product = new Product(req.body);
    await product.save();

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// Update product (admin only)
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

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
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // TODO: Delete associated files from Google Cloud Storage

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Upload product files (admin only)
exports.uploadProductFiles = async (req, res, next) => {
  try {
    // TODO: Implement file upload to Google Cloud Storage
    // This will be implemented in Phase 4

    res.status(501).json({ message: 'File upload not yet implemented' });
  } catch (error) {
    next(error);
  }
};
