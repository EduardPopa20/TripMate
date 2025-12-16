# Weather Service

Microservice wrapper for OpenWeatherMap API with Redis caching.

## Overview

**Port**: 3004
**External API**: OpenWeatherMap (5-day forecast)
**Cache**: Redis (15 minutes TTL)

## Features

- 5-day weather forecast
- 3-hour interval data
- Daily aggregated forecast
- Redis caching (15 min TTL)
- Automatic cache invalidation
- Error handling and logging

## Endpoints

### Get Weather Forecast
```http
GET /api/weather/:city
```

**Example**:
```bash
curl http://localhost:3004/api/weather/Paris
```

**Response**:
```json
{
  "success": true,
  "data": {
    "city": "Paris",
    "country": "FR",
    "forecast": [
      {
        "date": "2025-12-16",
        "temp_avg": 8.5,
        "temp_min": 5.2,
        "temp_max": 11.8,
        "weather": "Clouds",
        "description": "scattered clouds",
        "icon": "03d",
        "hourly": [...]
      }
    ]
  },
  "cached": false
}
```

### Health Check
```http
GET /api/health
```

**Response**:
```json
{
  "service": "weather-service",
  "status": "ok",
  "timestamp": "2025-12-15T18:20:00.000Z",
  "uptime": 123.45
}
```

## Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Setup environment**:
```bash
cp .env.example .env
# Edit .env with your OpenWeatherMap API key
```

3. **Start Redis** (required):
```bash
# From project root
docker-compose up redis -d
```

4. **Start service**:
```bash
npm run dev  # Development (with nodemon)
npm start    # Production
```

## Environment Variables

See `.env.example` for all required variables:

- `PORT` - Service port (default: 3004)
- `OPENWEATHER_API_KEY` - Your OpenWeatherMap API key
- `REDIS_URL` - Redis connection string
- `LOG_LEVEL` - Logging level (info, debug, error)

## Caching

Weather data is cached for **15 minutes** to reduce API calls.

**Cache Key Format**: `weather:{city_lowercase}`

**Example**: `weather:paris`

### Cache Behavior

1. **Cache HIT**: Returns cached data immediately
2. **Cache MISS**: Fetches from OpenWeatherMap API, caches result
3. **TTL**: 900 seconds (15 minutes)
4. **Invalidation**: Automatic after TTL expires

## Testing

```bash
# Run tests
npm test

# Test health endpoint
curl http://localhost:3004/api/health

# Test weather endpoint
curl http://localhost:3004/api/weather/London

# Check cache (with Redis CLI)
redis-cli
> GET weather:london
```

## Error Handling

| Error | Status | Message |
|-------|--------|---------|
| Missing city parameter | 400 | City parameter is required |
| City not found | 404 | City not found |
| Invalid API key | 401 | Invalid OpenWeatherMap API key |
| API key not configured | 500 | OpenWeatherMap API key not configured |
| OpenWeatherMap down | 500 | Weather API error |

## Docker

### Build Image
```bash
docker build -t weather-service .
```

### Run Container
```bash
docker run -p 3004:3004 \
  -e OPENWEATHER_API_KEY=your_key \
  -e REDIS_URL=redis://host.docker.internal:6379 \
  weather-service
```

### With Docker Compose
```bash
# From project root
docker-compose up weather-service
```

## Dependencies

- `express` - Web framework
- `axios` - HTTP client for OpenWeatherMap API
- `redis` - Redis client
- `winston` - Logging
- `cors` - CORS middleware
- `dotenv` - Environment variables

## Development

### Project Structure
```
weather-service/
├── index.js                      # Entry point
├── routes/
│   └── weatherRoutes.js          # API routes
├── controllers/
│   └── weatherController.js      # Request handlers
├── services/
│   └── weatherService.js         # OpenWeatherMap integration
├── middleware/
│   └── cacheMiddleware.js        # Redis caching
├── tests/
│   └── weather.test.js           # Jest tests
├── .env.example
├── package.json
├── Dockerfile
└── README.md
```

### Adding Features

1. Modify `services/weatherService.js` for API logic
2. Update `controllers/weatherController.js` for request handling
3. Add tests in `tests/`
4. Update this README

## Monitoring

### Logs
```bash
# View logs (if using Docker)
docker logs -f weather-service

# Logs include:
# - API requests (city, response time)
# - Cache hits/misses
# - Errors with stack traces
```

### Metrics
- Response time tracked in logs
- Cache hit rate: Check Redis stats
- API call count: Monitor OpenWeatherMap dashboard

## Troubleshooting

### Service won't start
1. Check `.env` file exists and has valid `OPENWEATHER_API_KEY`
2. Ensure Redis is running: `docker ps | grep redis`
3. Check port 3004 is not in use: `lsof -i :3004`

### Redis connection errors
1. Verify Redis is running: `docker-compose up redis -d`
2. Test connection: `redis-cli ping`
3. Check `REDIS_URL` in `.env`

### API key errors
1. Verify key is correct in `.env`
2. Check OpenWeatherMap dashboard for usage limits
3. Ensure key has forecast API access

### Cache not working
1. Check Redis connection: `redis-cli ping`
2. Verify TTL: `redis-cli TTL weather:paris`
3. Check logs for cache errors

## API Rate Limits

**OpenWeatherMap Free Tier**:
- 60 calls/minute
- 1,000,000 calls/month

**With 15-min caching**:
- Effective rate: ~4 calls/hour per unique city
- Supports ~250,000 unique city requests/month

---

**Version**: 1.0.0
**Last Updated**: 2025-12-15
