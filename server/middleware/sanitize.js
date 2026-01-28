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
    if (obj.hasOwnProperty(key)) {
      // Remove keys starting with $ or containing .
      const cleanKey = key.replace(/^\$/, '').replace(/\./g, '');
      sanitized[cleanKey] = sanitize(obj[key]);
    }
  }
  return sanitized;
};

const sanitizeMiddleware = (req, res, next) => {
  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.query) {
    req.query = sanitize(req.query);
  }
  if (req.params) {
    req.params = sanitize(req.params);
  }
  next();
};

module.exports = sanitizeMiddleware;
