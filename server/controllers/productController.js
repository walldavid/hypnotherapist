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
    // Parse JSON fields if they exist
    const productData = { ...req.body };
    
    if (req.body.features && typeof req.body.features === 'string') {
      try {
        productData.features = JSON.parse(req.body.features);
      } catch (e) {
        productData.features = req.body.features.split(',').map(f => f.trim());
      }
    }
    
    if (req.body.tags && typeof req.body.tags === 'string') {
      try {
        productData.tags = JSON.parse(req.body.tags);
      } catch (e) {
        productData.tags = req.body.tags.split(',').map(t => t.trim());
      }
    }

    // Handle image uploads
    if (req.files && req.files.images) {
      const imagePromises = req.files.images.map(async (file, index) => {
        // For now, create a data URL for the image
        // When GCS is configured, this will upload to cloud storage
        const base64 = file.buffer.toString('base64');
        const dataUrl = `data:${file.mimetype};base64,${base64}`;
        
        return {
          url: dataUrl,
          alt: productData.name || 'Product image',
          isPrimary: index === 0
        };
      });
      
      productData.images = await Promise.all(imagePromises);
    }

    const product = new Product(productData);
    await product.save();

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// Update product (admin only)
exports.updateProduct = async (req, res, next) => {
  try {
    // Parse JSON fields if they exist
    const updateData = { ...req.body };
    
    if (req.body.features && typeof req.body.features === 'string') {
      try {
        updateData.features = JSON.parse(req.body.features);
      } catch (e) {
        updateData.features = req.body.features.split(',').map(f => f.trim());
      }
    }
    
    if (req.body.tags && typeof req.body.tags === 'string') {
      try {
        updateData.tags = JSON.parse(req.body.tags);
      } catch (e) {
        updateData.tags = req.body.tags.split(',').map(t => t.trim());
      }
    }

    // Handle new image uploads
    if (req.files && req.files.images) {
      const imagePromises = req.files.images.map(async (file, index) => {
        const base64 = file.buffer.toString('base64');
        const dataUrl = `data:${file.mimetype};base64,${base64}`;
        
        return {
          url: dataUrl,
          alt: updateData.name || 'Product image',
          isPrimary: index === 0
        };
      });
      
      updateData.images = await Promise.all(imagePromises);
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
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
