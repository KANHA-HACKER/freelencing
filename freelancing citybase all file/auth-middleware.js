// middleware/auth.js - Authentication Middleware
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Verify JWT token and attach user to request
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Authorization denied.'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if user exists
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Authorization denied.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      userType: decoded.userType,
      userData: user
    };

    next();

  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Authorization denied.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error in authentication',
      error: error.message
    });
  }
};

// Check if user is freelancer
const freelancerOnly = (req, res, next) => {
  if (req.user.userType !== 'freelancer') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Freelancers only.'
    });
  }
  next();
};

// Check if user is client
const clientOnly = (req, res, next) => {
  if (req.user.userType !== 'client') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Clients only.'
    });
  }
  next();
};

module.exports = {
  authMiddleware,
  freelancerOnly,
  clientOnly
};