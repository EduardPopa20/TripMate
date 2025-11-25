import { Card, CardContent, Typography, Box } from '@mui/material';
import { format } from 'date-fns';

export default function WeatherCard({ forecast }) {
  const getWeatherIcon = (weather) => {
    const icons = {
      Clear: '☀️',
      Clouds: '☁️',
      Rain: '🌧️',
      Snow: '❄️',
      Thunderstorm: '⛈️',
      Drizzle: '🌦️',
      Mist: '🌫️',
      Fog: '🌫️',
    };
    return icons[weather] || '🌤️';
  };

  return (
    <Card
      sx={{
        minWidth: 150,
        textAlign: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: 6,
        },
        borderRadius: 3,
      }}
    >
      <CardContent>
        <Typography
          variant="caption"
          gutterBottom
          sx={{ opacity: 0.9, fontWeight: 500 }}
        >
          {format(new Date(forecast.date), 'EEE, MMM dd')}
        </Typography>

        <Box sx={{ fontSize: '3.5rem', my: 1.5 }}>
          {getWeatherIcon(forecast.weather)}
        </Box>

        <Typography variant="h4" component="div" gutterBottom sx={{ fontWeight: 600 }}>
          {Math.round(forecast.temp_avg)}°C
        </Typography>

        <Typography
          variant="body2"
          sx={{ opacity: 0.9, textTransform: 'capitalize', mb: 1.5 }}
        >
          {forecast.description}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 3,
            mt: 1,
            pt: 1.5,
            borderTop: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            ↑ {Math.round(forecast.temp_max)}°
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            ↓ {Math.round(forecast.temp_min)}°
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
