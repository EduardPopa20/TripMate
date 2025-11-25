import { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import WeatherCard from './WeatherCard';
import { weatherAPI } from '../api/client';

export default function WeatherForecast({ city }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (city) {
      fetchWeather();
    }
  }, [city]);

  const fetchWeather = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await weatherAPI.getByCity(city);
      setWeather(response.data.data);
    } catch (err) {
      console.error('Error fetching weather:', err);
      setError('Failed to load weather forecast. Please check OpenWeatherMap API key.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="warning">{error}</Alert>;
  }

  if (!weather) {
    return null;
  }

  return (
    <Box>
      <Typography
        variant="h5"
        gutterBottom
        sx={{ color: 'primary.main', fontWeight: 600, mb: 3 }}
      >
        🌤️ 5-Day Weather Forecast for {weather.city}
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
        {weather.forecast.map((day, index) => (
          <Box key={index} sx={{ flex: 1, minWidth: 150 }}>
            <WeatherCard forecast={day} />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
