const { auth, db } = require('../config/firebase');

/**
 * Middleware to verify Firebase Auth tokens
 * Used to protect routes that require authentication
 * Also accepts webhook secret for N8N compatibility
 */
const verifyToken = async (req, res, next) => {
  try {
    // First, check if webhook secret is provided (for N8N)
    const secret = process.env.WEBHOOK_SECRET;
    const providedSecret = req.headers['x-webhook-secret'];
    
    console.log('🔐 [AUTH] Checking authentication:', {
      hasSecret: !!secret,
      providedSecret: providedSecret ? '***' : 'none',
      hasAuthHeader: !!req.headers.authorization
    });
    
    if (secret && providedSecret && providedSecret === secret) {
      console.log('✅ [AUTH] Webhook secret validated');
      // Webhook secret is valid, create a mock user for N8N
      req.user = {
        uid: 'n8n-service',
        email: 'n8n-test@nutribuddy.com',
        role: 'service',
        isServiceAccount: true
      };
      return next();
    }

    // Otherwise, try Firebase token authentication
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'No token provided',
        message: 'Authentication required. Provide either Authorization: Bearer token or x-webhook-secret header.'
      });
    }

    // Verify the token with Firebase
    const decodedToken = await auth.verifyIdToken(token);
    
    // Get user data from Firestore to include role
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    const resolvedRole = userData.role || decodedToken.role || 'patient';
    
    // Attach user info to request
    req.user = {
      ...decodedToken,
      ...userData,
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: resolvedRole,
    };

    console.log('✅ [AUTH] User authenticated:', {
      uid: req.user.uid,
      email: req.user.email,
      role: req.user.role
    });

    next();
  } catch (error) {
    console.error('❌ [AUTH] Token verification error:', error.message);
    return res.status(401).json({
      error: 'Invalid token',
      message: 'Authentication failed'
    });
  }
};

/**
 * Middleware to verify user has specific role(s)
 * Usage: requireRole('prescriber') or requireRole(['prescriber', 'admin'])
 */
const requireRole = (allowedRoles) => {
  // Convert single role to array
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    // Service accounts bypass role check
    if (req.user.isServiceAccount) {
      return next();
    }

    const userRole = req.user.role || 'patient';

    if (!roles.includes(userRole)) {
      console.warn('⚠️ [AUTH] Role mismatch:', {
        required: roles,
        actual: userRole,
        user: req.user.uid
      });

      return res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Required role: ${roles.join(' or ')}, your role: ${userRole}`
      });
    }

    console.log('✅ [AUTH] Role verified:', {
      user: req.user.uid,
      role: userRole
    });

    next();
  };
};

/**
 * Middleware to check if user is a prescriber
 */
const requirePrescriber = requireRole('prescriber');

/**
 * Middleware to check if user is a patient
 */
const requirePatient = requireRole('patient');

/**
 * Middleware to check if user is an admin
 */
const requireAdmin = requireRole('admin');

/**
 * Middleware to check ownership of resource
 * Ensures user can only access their own data
 * Prescribers can access their patients' data
 */
const requireOwnership = async (req, res, next) => {
  try {
    const requestedUserId = req.params.userId || req.body.userId;
    const currentUserId = req.user.uid;
    const userRole = req.user.role;

    // Service accounts bypass ownership check
    if (req.user.isServiceAccount) {
      return next();
    }

    // User accessing their own data
    if (requestedUserId === currentUserId) {
      return next();
    }

    // Prescriber accessing patient's data - verify connection
    if (userRole === 'prescriber' && requestedUserId) {
      const connectionQuery = await db.collection('connections')
        .where('prescriberId', '==', currentUserId)
        .where('patientId', '==', requestedUserId)
        .where('status', '==', 'active')
        .limit(1)
        .get();

      if (!connectionQuery.empty) {
        console.log('✅ [AUTH] Prescriber accessing patient data:', {
          prescriber: currentUserId,
          patient: requestedUserId
        });
        return next();
      }
    }

    console.warn('⚠️ [AUTH] Ownership check failed:', {
      currentUser: currentUserId,
      requestedUser: requestedUserId,
      role: userRole
    });

    return res.status(403).json({
      error: 'Forbidden',
      message: 'You do not have permission to access this resource'
    });
  } catch (error) {
    console.error('❌ [AUTH] Ownership check error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to verify resource ownership'
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
  requireRole,
  requirePrescriber,
  requirePatient,
  requireAdmin,
  requireOwnership,
  verifyWebhook
};
