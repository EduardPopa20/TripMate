const express = require('express');
const router = express.Router();
const { getCurrency, convertAmount, getRates } = require('../controllers/currencyController');
const cacheMiddleware = require('../middleware/cacheMiddleware');

router.get('/currency/:from/:to', cacheMiddleware, getCurrency);

router.post('/currency/convert', convertAmount);

router.get('/currency/rates/:base', cacheMiddleware, getRates);

router.get('/health', (req, res) => {
  res.json({
    service: 'currency-service',
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;
