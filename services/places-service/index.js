require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('../../shared/utils/logger');
const errorHandler = require('../../shared/middleware/errorHandler');
const { connectRedis } = require('../../shared/config/redisClient');
const placesRoutes = require('./routes/placesRoutes');

const app = express();
const PORT = process.env.PORT || 3005;

process.env.SERVICE_NAME = 'places-service';

app.use(cors());
app.use(express.json());

app.use('/api', placesRoutes);

app.use(errorHandler);

async function startServer() {
  try {
    await connectRedis();
    logger.info('Redis connected successfully');

    app.listen(PORT, () => {
      logger.info(`Places Service running on port ${PORT}`);
      logger.info(`Health check: http://localhost:${PORT}/api/health`);
      logger.info(`Places endpoint: http://localhost:${PORT}/api/places/:city`);
    });
  } catch (error) {
    logger.error('Failed to start Places Service:', error);
    process.exit(1);
  }
}

startServer();
