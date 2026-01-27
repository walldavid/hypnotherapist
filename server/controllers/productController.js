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
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Delete associated files from Google Cloud Storage
    if (product.files && product.files.length > 0) {
      const gcsService = require('../services/gcsService');
      
      if (gcsService.isConfigured()) {
        try {
          const gcsUrls = product.files.map(file => file.gcsUrl);
          await gcsService.deleteFiles(gcsUrls);
          console.log(`Deleted ${gcsUrls.length} files from GCS for product ${product._id}`);
        } catch (error) {
          console.error('Error deleting files from GCS:', error);
          // Continue with product deletion even if file deletion fails
        }
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Upload product files (admin only)
exports.uploadProductFiles = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const gcsService = require('../services/gcsService');

    // Check if GCS is configured
    if (!gcsService.isConfigured()) {
      return res.status(503).json({ 
        error: 'File storage is not configured. Please set up Google Cloud Storage credentials.' 
      });
    }

    // Upload each file to Google Cloud Storage
    const uploadedFiles = [];

    for (const file of req.files) {
      try {
        const fileData = await gcsService.uploadFile(
          file.buffer,
          file.originalname,
          file.mimetype
        );

        uploadedFiles.push(fileData);
      } catch (error) {
        console.error(`Error uploading file ${file.originalname}:`, error);
        // Continue with other files even if one fails
      }
    }

    if (uploadedFiles.length === 0) {
      return res.status(500).json({ error: 'Failed to upload any files' });
    }

    // Add uploaded files to product
    product.files = product.files || [];
    product.files.push(...uploadedFiles);

    await product.save();

    res.json({
      message: `${uploadedFiles.length} file(s) uploaded successfully`,
      files: uploadedFiles,
      product: product
    });
  } catch (error) {
    next(error);
  }
};
