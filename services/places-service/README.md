# Places Service

Microservice wrapper for Overpass API (OpenStreetMap) with Redis caching for tourist attractions.

## Overview

**Port**: 3005
**External APIs**:
- Nominatim (geocoding)
- Overpass API (attractions data)
**Cache**: Redis (24 hours TTL)

## Features

- City geocoding (coordinates lookup)
- Tourist attractions discovery (5km radius)
- Multiple attraction types (tourism, restaurants, cafes, historic sites)
- Redis caching (24h TTL)
- Smart filtering and pagination (top 50 results)
- Error handling and logging

## Endpoints

### Get Places/Attractions
```http
GET /api/places/:city
```

**Example**:
```bash
curl http://localhost:3005/api/places/Paris
```

**Response**:
```json
{
  "success": true,
  "data": {
    "city": "Paris, Île-de-France, France",
    "coordinates": {
      "lat": 48.8566,
      "lon": 2.3522
    },
    "attractions": [
      {
        "name": "Eiffel Tower",
        "type": "attraction",
        "lat": 48.8584,
        "lon": 2.2945,
        "address": "Champ de Mars",
        "website": "https://www.toureiffel.paris",
        "phone": "+33892701239"
      },
      // ... more attractions
    ],
    "count": 50
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
  "service": "places-service",
  "status": "ok",
  "timestamp": "2025-12-15T18:40:00.000Z",
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
# No API key needed - OpenStreetMap APIs are free!
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

See `.env.example`:

- `PORT` - Service port (default: 3005)
- `REDIS_URL` - Redis connection string
- `LOG_LEVEL` - Logging level (info, debug, error)
- `NODE_ENV` - Environment (development/production)

**Note**: No API keys required! OpenStreetMap data is free and open.

## Caching

Places data is cached for **24 hours** to reduce load on Overpass API.

**Cache Key Format**: `places:{city_lowercase}`

**Example**: `places:paris`

### Cache Behavior

1. **Cache HIT**: Returns cached data immediately
2. **Cache MISS**: Fetches from Overpass API (slow ~5-10s), caches result
3. **TTL**: 86400 seconds (24 hours)
4. **Invalidation**: Automatic after TTL expires

## Data Sources

### Nominatim (Geocoding)
- Converts city name to coordinates (lat/lon)
- Free service by OpenStreetMap
- Requires User-Agent header

### Overpass API (Attractions)
- Queries OpenStreetMap database
- Searches within 5km radius of city center
- Filters by tags: `tourism`, `amenity`, `historic`
- Returns up to 50 top results

## Attraction Types

The service fetches:
- **Tourism**: attractions, museums, viewpoints, monuments
- **Amenity**: restaurants, cafes, bars
- **Historic**: castles, ruins, memorials

## Testing

```bash
# Run tests
npm test

# Test health endpoint
curl http://localhost:3005/api/health

# Test places endpoint
curl http://localhost:3005/api/places/London

# Test with spaces in city name
curl "http://localhost:3005/api/places/New%20York"

# Check cache (with Redis CLI)
redis-cli
> GET places:london
> TTL places:london  # Should show ~86400 seconds
```

## Error Handling

| Error | Status | Message |
|-------|--------|---------|
| Missing city parameter | 400 | City parameter is required |
| City not found | 404 | City not found |
| Overpass API timeout | 500 | Failed to fetch attractions |
| Geocoding failure | 500 | Failed to geocode city |

## Performance Notes

### Slow First Request
The first request for a city is **slow** (~5-15 seconds) because:
1. Nominatim geocoding (~1-2s)
2. Overpass API query (~5-10s)
3. Large data processing

**Solution**: Aggressive 24h caching ensures subsequent requests are instant.

### Rate Limits
- **Nominatim**: Max 1 request/second
- **Overpass**: No strict limits, but please be reasonable
- **Caching**: Reduces API load significantly

## Docker

### Build Image
```bash
docker build -t places-service .
```

### Run Container
```bash
docker run -p 3005:3005 \
  -e REDIS_URL=redis://host.docker.internal:6379 \
  places-service
```

### With Docker Compose
```bash
# From project root
docker-compose up places-service
```

## Dependencies

- `express` - Web framework
- `axios` - HTTP client for APIs
- `redis` - Redis client
- `winston` - Logging
- `cors` - CORS middleware
- `dotenv` - Environment variables

## Development

### Project Structure
```
places-service/
├── index.js                      # Entry point
├── routes/
│   └── placesRoutes.js          # API routes
├── controllers/
│   └── placesController.js      # Request handlers
├── services/
│   └── placesService.js         # Overpass/Nominatim integration
├── middleware/
│   └── cacheMiddleware.js       # Redis caching (24h TTL)
├── tests/
│   └── places.test.js           # Jest tests
├── .env.example
├── package.json
├── Dockerfile
└── README.md
```

### API Query Customization

Edit `services/placesService.js` to modify:
- **Radius**: Change `radius = 5000` (meters)
- **Categories**: Add more node types in Overpass query
- **Result limit**: Change `.slice(0, 50)` to return more/less

Example - Add shopping malls:
```javascript
node["shop"="mall"](around:${radius},${coords.lat},${coords.lon});
```

## Monitoring

### Logs
```bash
# View logs (if using Docker)
docker logs -f places-service

# Logs include:
# - Geocoding requests
# - Overpass API queries
# - Cache hits/misses
# - Processing time
# - Errors with stack traces
```

### Metrics
- Response time: Logged for each request
- Cache hit rate: Check Redis stats
- Attraction count per city

## Troubleshooting

### Service won't start
1. Check `.env` file exists
2. Ensure Redis is running: `docker ps | grep redis`
3. Check port 3005 is not in use: `lsof -i :3005`

### Redis connection errors
1. Verify Redis is running: `docker-compose up redis -d`
2. Test connection: `redis-cli ping`
3. Check `REDIS_URL` in `.env`

### "City not found" errors
- Check city name spelling
- Try full city name: "New York, USA"
- Some small towns may not be in Nominatim

### Overpass API timeout
- Overpass API can be slow or overloaded
- Service has 30s timeout
- Check Overpass API status: https://overpass-api.de/api/status

### No attractions returned
- City might have no tagged attractions in OSM
- Try increasing radius in `placesService.js`
- Check OpenStreetMap directly: https://www.openstreetmap.org

### Cache not working
1. Check Redis connection: `redis-cli ping`
2. Verify TTL: `redis-cli TTL places:paris`
3. Check logs for cache errors

## Example Requests

```bash
# Major cities (fast with cache)
curl http://localhost:3005/api/places/Paris
curl http://localhost:3005/api/places/London
curl http://localhost:3005/api/places/Tokyo

# Cities with spaces
curl "http://localhost:3005/api/places/New%20York"
curl "http://localhost:3005/api/places/Los%20Angeles"

# Specific regions
curl "http://localhost:3005/api/places/Paris,%20France"
curl "http://localhost:3005/api/places/Berlin,%20Germany"

# Check caching
curl -w "\nTime: %{time_total}s\n" http://localhost:3005/api/places/Rome
# First time: ~8 seconds
# Second time: ~0.05 seconds (cached!)
```

## API Rate Limits & Best Practices

### Nominatim
- Max 1 request/second
- Service auto-delays if needed
- Must include User-Agent header (implemented)

### Overpass API
- No strict limits, but be considerate
- Can be slow during peak hours
- 30s timeout implemented

### Our Caching Strategy
- 24h TTL reduces API calls by 99%+
- ~4 API calls per city per day (worst case)
- Handles thousands of requests/day per city with single API call

---

**Version**: 1.0.0
**Last Updated**: 2025-12-15
**Status**: Production Ready
