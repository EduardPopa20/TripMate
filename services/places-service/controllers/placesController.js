const { getAttractions } = require('../services/placesService');
const logger = require('../../../shared/utils/logger');

async function getPlaces(req, res, next) {
  try {
    const { city } = req.params;

    if (!city) {
      return res.status(400).json({ error: 'City parameter is required' });
    }

    logger.info(`Places request for city: ${city}`);

    const placesData = await getAttractions(city);

    res.json({
      success: true,
      data: placesData,
      cached: req.cached || false
    });
  } catch (error) {
    if (error.message === 'City not found') {
      return res.status(404).json({
        error: {
          message: 'City not found',
          status: 404
        }
      });
    }

    logger.error(`Places controller error:`, { error: error.message });
    next(error);
  }
}

module.exports = { getPlaces };
