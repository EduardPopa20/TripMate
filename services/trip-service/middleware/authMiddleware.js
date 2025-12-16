const logger = require('../../../shared/utils/logger');

function authMiddleware(req, res, next) {
  try {
    const userId = req.headers['x-user-id'];

    if (!userId) {
      logger.warn('Request without user_id');
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'x-user-id header required'
      });
    }

    req.user = {
      id: userId
    };

    logger.debug(`Authenticated user: ${userId}`);
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
}

module.exports = authMiddleware;
