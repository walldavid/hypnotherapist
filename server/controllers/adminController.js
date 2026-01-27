const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// Admin login
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Find admin with password field
    const admin = await Admin.findOne({ username }).select('+password');

    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if account is locked
    if (admin.isLocked()) {
      return res.status(423).json({ error: 'Account is locked. Please try again later.' });
    }

    // Check if account is active
    if (admin.status !== 'active') {
      return res.status(403).json({ error: 'Account is not active' });
    }

    // Verify password
    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      await admin.incrementLoginAttempts();
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Reset login attempts on successful login
    await admin.resetLoginAttempts();

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// Admin logout
exports.logout = async (req, res) => {
  // Token invalidation would be handled on client side
  // Or implement token blacklist in production
  res.json({ message: 'Logged out successfully' });
};

// Get current admin
exports.getCurrentAdmin = async (req, res) => {
  res.json({
    admin: {
      id: req.admin._id,
      username: req.admin.username,
      email: req.admin.email,
      name: req.admin.name,
      role: req.admin.role,
      lastLogin: req.admin.lastLogin
    }
  });
};

// Get dashboard stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalProducts,
      activeProducts,
      totalOrders,
      completedOrders,
      totalRevenue,
      totalUsers
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ status: 'active' }),
      Order.countDocuments(),
      Order.countDocuments({ paymentStatus: 'completed' }),
      Order.aggregate([
        { $match: { paymentStatus: 'completed' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      User.countDocuments()
    ]);

    // Recent orders
    const recentOrders = await Order.find()
      .sort('-createdAt')
      .limit(10)
      .populate('items.product', 'name price');

    // Top selling products
    const topProducts = await Product.find({ status: 'active' })
      .sort('-salesCount')
      .limit(5)
      .select('name price salesCount');

    res.json({
      stats: {
        totalProducts,
        activeProducts,
        totalOrders,
        completedOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalUsers
      },
      recentOrders,
      topProducts
    });
  } catch (error) {
    next(error);
  }
};
