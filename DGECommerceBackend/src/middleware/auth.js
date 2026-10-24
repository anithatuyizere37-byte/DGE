const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dg_ecommerce_secret_rwamagana_2026';

/**
 * Middleware: Verify JWT token and attach user to request
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

/**
 * Middleware: Require Owner role
 */
function requireOwner(req, res, next) {
  if (req.user?.role !== 'owner') {
    return res.status(403).json({ message: 'Forbidden: Owner access required' });
  }
  next();
}

/**
 * Middleware: Optional authentication (attaches user if valid token present, allows guest otherwise)
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (!err && user) {
      req.user = user;
    }
    next();
  });
}

const requireAuth = authenticateToken;

module.exports = { authenticateToken, requireOwner, requireAuth, optionalAuth };
