const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const logger = require('../config/logger');
const {jwtsecret}=require('../config/config')

const JWT_SECRET = jwtsecret;

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if user exists
    const [users] = await query('SELECT id, role FROM users WHERE id = $1', [decoded.id]);
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    // Add user info to request
    req.user = {
      id: users[0].id,
      role: users[0].role
    };
    
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;