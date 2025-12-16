const axios = require('axios');
const logger = require('../../../shared/utils/logger');

const API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

async function getWeatherForecast(city) {
  try {
    if (!API_KEY || API_KEY === 'your_openweather_key') {
      logger.error('OpenWeatherMap API key not configured');
      throw new Error('OpenWeatherMap API key not configured');
    }

    logger.info(`Fetching weather forecast for: ${city}`);

    const response = await axios.get(`${BASE_URL}/forecast`, {
      params: {
        q: city,
        appid: API_KEY,
        units: 'metric',
        cnt: 40
      }
    });

    const forecast = response.data.list.map(item => ({
      date: item.dt_txt,
      temp: item.main.temp,
      feels_like: item.main.feels_like,
      temp_min: item.main.temp_min,
      temp_max: item.main.temp_max,
      weather: item.weather[0].main,
      description: item.weather[0].description,
      icon: item.weather[0].icon,
      humidity: item.main.humidity,
      wind_speed: item.wind.speed
    }));

    const dailyForecast = [];
    const grouped = {};

    forecast.forEach(item => {
      const date = item.date.split(' ')[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(item);
    });

    Object.keys(grouped).slice(0, 5).forEach(date => {
      const dayData = grouped[date];
      const temps = dayData.map(d => d.temp);
      const midday = dayData[Math.floor(dayData.length / 2)];

      dailyForecast.push({
        date,
        temp_avg: (Math.max(...temps) + Math.min(...temps)) / 2,
        temp_min: Math.min(...temps),
        temp_max: Math.max(...temps),
        weather: midday.weather,
        description: midday.description,
        icon: midday.icon,
        hourly: dayData
      });
    });

    const result = {
      city: response.data.city.name,
      country: response.data.city.country,
      forecast: dailyForecast
    };

    logger.info(`Weather forecast retrieved successfully for: ${city}`);
    return result;
  } catch (error) {
    if (error.response?.status === 404) {
      logger.warn(`City not found: ${city}`);
      throw new Error('City not found');
    }
    if (error.response?.status === 401) {
      logger.error('Invalid OpenWeatherMap API key');
      throw new Error('Invalid OpenWeatherMap API key');
    }
    logger.error(`Weather API error for ${city}:`, { error: error.message });
    throw error;
  }
}

module.exports = { getWeatherForecast };
