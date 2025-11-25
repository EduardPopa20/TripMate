const { getWeatherForecast } = require('../services/weatherService');

async function getWeather(req, res) {
  try {
    const { city } = req.params;

    if (!city) {
      return res.status(400).json({ error: 'City parameter is required' });
    }

    const weatherData = await getWeatherForecast(city);

    if (res.sendCachedResponse) {
      res.sendCachedResponse(weatherData);
    } else {
      res.json({ data: weatherData });
    }
  } catch (error) {
    console.error('Error fetching weather:', error);

    if (error.message === 'City not found') {
      return res.status(404).json({ error: 'City not found' });
    }

    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
}

module.exports = { getWeather };
