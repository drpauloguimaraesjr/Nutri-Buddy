const { auth } = require('../config/firebase');

/**
 * Middleware to verify Firebase Auth tokens
 * Used to protect routes that require authentication
 */
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'No token provided',
        message: 'Authentication required'
      });
    }

    // Verify the token with Firebase
    const decodedToken = await auth.verifyIdToken(token);
    
    // Attach user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      ...decodedToken
    };

    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    return res.status(401).json({
      error: 'Invalid token',
      message: 'Authentication failed'
    });
  }
};

/**
 * Optional middleware for webhook validation
 * Used for N8N webhook security
 */
const verifyWebhook = (req, res, next) => {
  const secret = process.env.WEBHOOK_SECRET;
  
  // If no secret configured, skip validation
  if (!secret) {
    return next();
  }

  const providedSecret = req.headers['x-webhook-secret'];

  if (!providedSecret || providedSecret !== secret) {
    return res.status(403).json({
      error: 'Invalid webhook secret',
      message: 'Unauthorized request'
    });
  }

  next();
};

module.exports = {
  verifyToken,
  verifyWebhook
};

