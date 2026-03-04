const jwt = require('jsonwebtoken');
const admins = require('../collections/admins');

// Authenticate admin JWT token
exports.authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No authentication token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await admins.getById(decoded.id);

    if (!admin) {
      return res.status(401).json({ error: 'Admin not found' });
    }

    if (admin.status !== 'active') {
      return res.status(403).json({ error: 'Admin account is not active' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Check for superadmin role
exports.requireSuperAdmin = (req, res, next) => {
  if (req.admin.role !== 'superadmin') {
    return res.status(403).json({ error: 'Superadmin access required' });
  }
  next();
};
