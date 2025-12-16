const express = require('express');
const router = express.Router();
const { getWeather } = require('../controllers/weatherController');
const cacheMiddleware = require('../middleware/cacheMiddleware');

router.get('/weather/:city', cacheMiddleware, getWeather);

router.get('/health', (req, res) => {
  res.json({
    service: 'weather-service',
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;
