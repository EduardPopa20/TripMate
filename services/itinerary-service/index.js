require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('../../shared/utils/logger');
const errorHandler = require('../../shared/middleware/errorHandler');
const itineraryRoutes = require('./routes/itineraryRoutes');

const app = express();
const PORT = process.env.PORT || 3002;

process.env.SERVICE_NAME = 'itinerary-service';

app.use(cors());
app.use(express.json());

app.use('/api', itineraryRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Itinerary Service running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
