require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('../../shared/utils/logger');
const errorHandler = require('../../shared/middleware/errorHandler');
const budgetRoutes = require('./routes/budgetRoutes');

const app = express();
const PORT = process.env.PORT || 3003;

process.env.SERVICE_NAME = 'budget-service';

app.use(cors());
app.use(express.json());

app.use('/api', budgetRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Budget Service running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Currency Service URL: ${process.env.CURRENCY_SERVICE_URL || 'http://localhost:3006'}`);
});

module.exports = app;
