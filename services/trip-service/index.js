require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('../../shared/utils/logger');
const errorHandler = require('../../shared/middleware/errorHandler');
const tripRoutes = require('./routes/tripRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

process.env.SERVICE_NAME = 'trip-service';

app.use(cors());
app.use(express.json());

app.use('/api', tripRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Trip Service running on port ${PORT}`);
  logger.info(`Health check: http://localhost:${PORT}/api/health`);
  logger.info(`Endpoints:`);
  logger.info(`  POST   /api/trips - Create trip`);
  logger.info(`  GET    /api/trips - List all trips`);
  logger.info(`  GET    /api/trips/:id - Get trip details`);
  logger.info(`  PUT    /api/trips/:id - Update trip`);
  logger.info(`  DELETE /api/trips/:id - Delete trip`);
  logger.info(`Authentication: Requires x-user-id header`);
});
