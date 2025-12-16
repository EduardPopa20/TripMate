require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('../../shared/utils/logger');
const errorHandler = require('../../shared/middleware/errorHandler');
const { connectRedis } = require('../../shared/config/redisClient');
const weatherRoutes = require('./routes/weatherRoutes');

const app = express();
const PORT = process.env.PORT || 3004;

process.env.SERVICE_NAME = 'weather-service';

app.use(cors());
app.use(express.json());

app.use('/api', weatherRoutes);

app.use(errorHandler);

async function startServer() {
  try {
    await connectRedis();
    logger.info('Redis connected successfully');

    app.listen(PORT, () => {
      logger.info(`Weather Service running on port ${PORT}`);
      logger.info(`Health check: http://localhost:${PORT}/api/health`);
      logger.info(`Weather endpoint: http://localhost:${PORT}/api/weather/:city`);
    });
  } catch (error) {
    logger.error('Failed to start Weather Service:', error);
    process.exit(1);
  }
}

startServer();
