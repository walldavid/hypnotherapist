/**
 * Manual NoSQL Injection Prevention Middleware
 * Temporary replacement for express-mongo-sanitize
 * Removes $ and . characters from user input
 */

const sanitize = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitize(item));
  }

  const sanitized = {};
  for (const key in obj) {
    // Use Object.prototype.hasOwnProperty to avoid prototype pollution
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // Remove keys starting with $ or containing .
      const cleanKey = key.replace(/^\$/, '').replace(/\./g, '');
      sanitized[cleanKey] = sanitize(obj[key]);
    }
  }
  return sanitized;
};

const sanitizeMiddleware = (req, res, next) => {
  try {
    if (req.body && typeof req.body === 'object') {
      req.body = sanitize(req.body);
    }
    if (req.query && typeof req.query === 'object') {
      req.query = sanitize(req.query);
    }
    if (req.params && typeof req.params === 'object') {
      req.params = sanitize(req.params);
    }
    next();
  } catch (error) {
    console.error('Sanitization error:', error);
    next(); // Continue even if sanitization fails
  }
};

module.exports = sanitizeMiddleware;
