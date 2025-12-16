const express = require('express');
const router = express.Router();
const { getPlaces } = require('../controllers/placesController');
const cacheMiddleware = require('../middleware/cacheMiddleware');

router.get('/places/:city', cacheMiddleware, getPlaces);

router.get('/health', (req, res) => {
  res.json({
    service: 'places-service',
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;
