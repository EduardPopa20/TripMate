require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('../../shared/utils/logger');
const errorHandler = require('../../shared/middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');
const proxyRoutes = require('./routes/proxyRoutes');
const healthRoutes = require('./routes/healthRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

process.env.SERVICE_NAME = 'api-gateway';

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path}`, {
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
  });
  next();
});

app.use(generalLimiter);

app.get('/', (req, res) => {
  res.json({
    service: 'TripMate API Gateway',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      trips: '/api/trips',
      itinerary: '/api/itinerary',
      attractions: '/api/attractions',
      expenses: '/api/expenses',
      budget: '/api/budget',
      weather: '/api/weather',
      places: '/api/places',
      currency: '/api/currency'
    },
    documentation: 'See README.md for API documentation'
  });
});

app.use('/', healthRoutes);

app.use('/api', proxyRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
    availableEndpoints: [
      '/health',
      '/api/trips',
      '/api/itinerary',
      '/api/attractions',
      '/api/expenses',
      '/api/budget',
      '/api/weather',
      '/api/places',
      '/api/currency'
    ]
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
  logger.info('Service URLs:');
  logger.info(`  - Trip Service: ${process.env.TRIP_SERVICE_URL || 'http://localhost:3001'}`);
  logger.info(`  - Itinerary Service: ${process.env.ITINERARY_SERVICE_URL || 'http://localhost:3002'}`);
  logger.info(`  - Budget Service: ${process.env.BUDGET_SERVICE_URL || 'http://localhost:3003'}`);
  logger.info(`  - Weather Service: ${process.env.WEATHER_SERVICE_URL || 'http://localhost:3004'}`);
  logger.info(`  - Places Service: ${process.env.PLACES_SERVICE_URL || 'http://localhost:3005'}`);
  logger.info(`  - Currency Service: ${process.env.CURRENCY_SERVICE_URL || 'http://localhost:3006'}`);
});

module.exports = app;
