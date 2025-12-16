const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { authMiddleware, optionalAuth } = require('../middleware/authMiddleware');
const logger = require('../../../shared/utils/logger');

const router = express.Router();

const TRIP_SERVICE_URL = process.env.TRIP_SERVICE_URL || 'http://localhost:3001';
const ITINERARY_SERVICE_URL = process.env.ITINERARY_SERVICE_URL || 'http://localhost:3002';
const BUDGET_SERVICE_URL = process.env.BUDGET_SERVICE_URL || 'http://localhost:3003';
const WEATHER_SERVICE_URL = process.env.WEATHER_SERVICE_URL || 'http://localhost:3004';
const PLACES_SERVICE_URL = process.env.PLACES_SERVICE_URL || 'http://localhost:3005';
const CURRENCY_SERVICE_URL = process.env.CURRENCY_SERVICE_URL || 'http://localhost:3006';

const proxyOptions = {
  changeOrigin: true,
  logLevel: 'silent',
  onProxyReq: (proxyReq, req, res) => {
    if (req.user?.id) {
      proxyReq.setHeader('x-user-id', req.user.id);
    }
    logger.debug(`Proxying ${req.method} ${req.path} to ${proxyReq.path}`);
  },
  onError: (err, req, res) => {
    logger.error(`Proxy error for ${req.method} ${req.path}:`, err.message);
    res.status(503).json({
      error: 'Service Unavailable',
      message: 'The requested service is temporarily unavailable',
      service: req.baseUrl
    });
  }
};

router.use('/trips', authMiddleware, createProxyMiddleware({
  target: TRIP_SERVICE_URL,
  pathRewrite: { '^/api/trips': '/api/trips' },
  ...proxyOptions
}));

router.use('/itinerary', authMiddleware, createProxyMiddleware({
  target: ITINERARY_SERVICE_URL,
  pathRewrite: { '^/api/itinerary': '/api/itinerary' },
  ...proxyOptions
}));

router.use('/attractions', authMiddleware, createProxyMiddleware({
  target: ITINERARY_SERVICE_URL,
  pathRewrite: { '^/api/attractions': '/api/attractions' },
  ...proxyOptions
}));

router.use('/expenses', authMiddleware, createProxyMiddleware({
  target: BUDGET_SERVICE_URL,
  pathRewrite: { '^/api/expenses': '/api/expenses' },
  ...proxyOptions
}));

router.use('/budget', authMiddleware, createProxyMiddleware({
  target: BUDGET_SERVICE_URL,
  pathRewrite: { '^/api/budget': '/api/budget' },
  ...proxyOptions
}));

router.use('/weather', optionalAuth, createProxyMiddleware({
  target: WEATHER_SERVICE_URL,
  pathRewrite: { '^/api/weather': '/api/weather' },
  ...proxyOptions
}));

router.use('/places', optionalAuth, createProxyMiddleware({
  target: PLACES_SERVICE_URL,
  pathRewrite: { '^/api/places': '/api/places' },
  ...proxyOptions
}));

router.use('/currency', optionalAuth, createProxyMiddleware({
  target: CURRENCY_SERVICE_URL,
  pathRewrite: { '^/api/currency': '/api/currency' },
  ...proxyOptions
}));

module.exports = router;
