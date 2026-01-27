const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const crypto = require('crypto');

// Create order
exports.createOrder = async (req, res, next) => {
  try {
    const { customerEmail, customerName, items, paymentMethod } = req.body;

    // Validate and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product || product.status !== 'active') {
        return res.status(400).json({ error: `Product ${item.product} not found or inactive` });
      }

      orderItems.push({
        product: product._id,
        productName: product.name,
        price: product.price,
        quantity: item.quantity || 1
      });

      subtotal += product.price * (item.quantity || 1);
    }

    // Calculate tax (if applicable)
    const tax = 0; // TODO: Implement tax calculation based on location
    const total = subtotal + tax;

    // Create order
    const order = new Order({
      customerEmail,
      customerName,
      items: orderItems,
      subtotal,
      tax,
      total,
      paymentMethod,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    await order.save();

    // Find or create user
    let user = await User.findOne({ email: customerEmail });
    if (!user) {
      user = new User({ email: customerEmail, name: customerName });
    }

    // Add purchase to user
    user.purchases.push({
      order: order._id,
      product: orderItems.map(item => item.product)
    });
    user.orderCount += 1;
    await user.save();

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

// Get all orders (admin)
exports.getAllOrders = async (req, res, next) => {
  try {
    const { status, paymentStatus, limit = 50, page = 1 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const orders = await Order.find(query)
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('items.product', 'name');

    const total = await Order.countDocuments(query);

    res.json({
      orders,
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

// Get order by ID (admin)
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name price category');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

// Get order by order number (public, for customer)
exports.getOrderByNumber = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;
    const { email } = req.query;

    const order = await Order.findOne({ orderNumber })
      .populate('items.product', 'name price category');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify email matches
    if (email && order.customerEmail !== email.toLowerCase()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

// Update order status (admin)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, paymentStatus } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();

    res.json(order);
  } catch (error) {
    next(error);
  }
};

// Generate download tokens after successful payment
exports.generateDownloadTokens = async (orderId) => {
  try {
    const order = await Order.findById(orderId).populate('items.product');

    if (!order) {
      throw new Error('Order not found');
    }

    const downloads = [];

    for (const item of order.items) {
      const product = item.product;
      
      if (!product || !product.files || product.files.length === 0) {
        continue;
      }

      // Generate secure download token
      const token = crypto.randomBytes(32).toString('hex');
      
      // Calculate expiry date
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + product.downloadExpiry);

      downloads.push({
        product: product._id,
        downloadToken: token,
        downloadCount: 0,
        expiresAt
      });
    }

    order.downloads = downloads;
    await order.save();

    return order;
  } catch (error) {
    throw error;
  }
};
