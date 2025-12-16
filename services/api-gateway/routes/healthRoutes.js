const express = require('express');
const axios = require('axios');
const logger = require('../../../shared/utils/logger');

const router = express.Router();

const services = [
  { name: 'trip-service', url: process.env.TRIP_SERVICE_URL || 'http://localhost:3001', endpoint: '/api/health' },
  { name: 'itinerary-service', url: process.env.ITINERARY_SERVICE_URL || 'http://localhost:3002', endpoint: '/api/health' },
  { name: 'budget-service', url: process.env.BUDGET_SERVICE_URL || 'http://localhost:3003', endpoint: '/api/health' },
  { name: 'weather-service', url: process.env.WEATHER_SERVICE_URL || 'http://localhost:3004', endpoint: '/api/health' },
  { name: 'places-service', url: process.env.PLACES_SERVICE_URL || 'http://localhost:3005', endpoint: '/api/health' },
  { name: 'currency-service', url: process.env.CURRENCY_SERVICE_URL || 'http://localhost:3006', endpoint: '/api/health' }
];

async function checkServiceHealth(service) {
  try {
    const response = await axios.get(`${service.url}${service.endpoint}`, { timeout: 3000 });
    return {
      name: service.name,
      status: 'healthy',
      url: service.url,
      responseTime: response.headers['x-response-time'] || 'N/A',
      data: response.data
    };
  } catch (error) {
    logger.error(`Health check failed for ${service.name}:`, error.message);
    return {
      name: service.name,
      status: 'unhealthy',
      url: service.url,
      error: error.message
    };
  }
}

router.get('/health', async (req, res) => {
  try {
    const healthChecks = await Promise.all(services.map(checkServiceHealth));

    const allHealthy = healthChecks.every(check => check.status === 'healthy');
    const healthyCount = healthChecks.filter(check => check.status === 'healthy').length;

    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'healthy' : 'degraded',
      gateway: {
        name: 'api-gateway',
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      },
      services: healthChecks,
      summary: {
        total: services.length,
        healthy: healthyCount,
        unhealthy: services.length - healthyCount
      }
    });
  } catch (error) {
    logger.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to perform health checks',
      error: error.message
    });
  }
});

router.get('/health/:serviceName', async (req, res) => {
  const { serviceName } = req.params;
  const service = services.find(s => s.name === serviceName);

  if (!service) {
    return res.status(404).json({
      error: 'Service not found',
      availableServices: services.map(s => s.name)
    });
  }

  const health = await checkServiceHealth(service);
  res.status(health.status === 'healthy' ? 200 : 503).json(health);
});

module.exports = router;
