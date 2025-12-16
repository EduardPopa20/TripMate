function authMiddleware(req, res, next) {
  const userId = req.headers['x-user-id'];

  if (!userId) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'x-user-id header is required'
    });
  }

  req.user = { id: userId };
  next();
}

module.exports = authMiddleware;
