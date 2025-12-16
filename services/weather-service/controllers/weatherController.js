const { getWeatherForecast } = require('../services/weatherService');
const logger = require('../../../shared/utils/logger');

async function getWeather(req, res, next) {
  try {
    const { city } = req.params;

    if (!city) {
      return res.status(400).json({ error: 'City parameter is required' });
    }

    logger.info(`Weather request for city: ${city}`);

    const weatherData = await getWeatherForecast(city);

    res.json({
      success: true,
      data: weatherData,
      cached: req.cached || false
    });
  } catch (error) {
    logger.error(`Weather controller error:`, { error: error.message });
    next(error);
  }
}

module.exports = { getWeather };
