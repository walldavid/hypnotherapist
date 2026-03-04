const jwt = require('jsonwebtoken');
const admins = require('../collections/admins');
const orders = require('../collections/orders');
const products = require('../collections/products');
const users = require('../collections/users');

// Admin login
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const admin = await admins.findByUsername(username);
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (admins.isLocked(admin)) {
      return res.status(423).json({ error: 'Account is locked. Please try again later.' });
    }

    if (admin.status !== 'active') {
      return res.status(403).json({ error: 'Account is not active' });
    }

    const isMatch = await admins.comparePassword(admin, password);
    if (!isMatch) {
      await admins.incrementLoginAttempts(admin.id);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await admins.resetLoginAttempts(admin.id);

    const token = jwt.sign(
      { id: admin.id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      admin: { id: admin.id, username: admin.username, email: admin.email, name: admin.name, role: admin.role },
    });
  } catch (error) {
    next(error);
  }
};

// Admin logout
exports.logout = async (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

// Get current admin
exports.getCurrentAdmin = async (req, res) => {
  res.json({
    admin: {
      id: req.admin.id,
      username: req.admin.username,
      email: req.admin.email,
      name: req.admin.name,
      role: req.admin.role,
      lastLogin: req.admin.lastLogin,
    },
  });
};

// Get dashboard stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [totalProducts, activeProducts, totalOrders, completedOrders, totalRevenue, totalUsers] =
      await Promise.all([
        products.countDocuments(),
        products.countDocuments({ status: 'active' }),
        orders.countDocuments(),
        orders.countDocuments({ paymentStatus: 'completed' }),
        orders.getTotalRevenue(),
        users.countDocuments(),
      ]);

    const recentOrders = await orders.getRecentOrders(10);
    const topProducts = await products.getTopBySales(5);

    res.json({
      stats: { totalProducts, activeProducts, totalOrders, completedOrders, totalRevenue, totalUsers },
      recentOrders,
      topProducts,
    });
  } catch (error) {
    next(error);
  }
};
