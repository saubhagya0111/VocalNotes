const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const token = req.header('Authorization').replace('Bearer ', '');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user by decoded userId
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized access' });
      }

      // Check if the user's role matches the required role
      if (user.role !== requiredRole) {
        return res.status(403).json({ message: 'Access denied' });
      }

      req.user = user;  // Attach the user to the request object
      next();  // Continue to the next middleware or route handler
    } catch (error) {
      res.status(401).json({ message: 'Authentication failed', error: error.message });
    }
  };
};

module.exports = authMiddleware;
