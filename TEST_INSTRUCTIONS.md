# 🧪 Weather Service - Testing Instructions

## Prerequisites Check

### 1. Dependencies Installed ✅
```bash
# Shared utilities
cd shared && npm install

# Weather Service
cd services/weather-service && npm install
```

### 2. Environment Configuration ✅
File: `services/weather-service/.env`
```env
PORT=3004
NODE_ENV=development
SERVICE_NAME=weather-service
REDIS_URL=redis://localhost:6379
OPENWEATHER_API_KEY=b85318feeb3622c40d9337e76ed0a3af
LOG_LEVEL=info
```

### 3. Docker & Redis 🔄
```bash
# Start Docker Desktop (if not running)
# Then start Redis:
cd /Users/popaeduardcostin/Desktop/TripMate
docker-compose up -d redis

# Verify Redis is running:
docker ps
# Should show: tripmate-redis container running on port 6379

# Test Redis connection:
docker exec -it tripmate-redis redis-cli ping
# Should return: PONG
```

---

## Testing Steps

### Step 1: Start Weather Service

**Terminal 1** (Weather Service):
```bash
cd /Users/popaeduardcostin/Desktop/TripMate/services/weather-service
npm run dev
```

**Expected Output**:
```
[weather-service] info: Redis client connected
[weather-service] info: Redis connection established
[weather-service] info: Weather Service running on port 3004
[weather-service] info: Health check: http://localhost:3004/api/health
[weather-service] info: Weather endpoint: http://localhost:3004/api/weather/:city
```

---

### Step 2: Test Health Endpoint

**Terminal 2** (Testing):
```bash
curl http://localhost:3004/api/health
```

**Expected Response**:
```json
{
  "service": "weather-service",
  "status": "ok",
  "timestamp": "2025-12-15T18:30:00.000Z",
  "uptime": 5.123
}
```

✅ **Success Criteria**: Status 200, service name correct, uptime > 0

---

### Step 3: Test Weather Endpoint (First Call - No Cache)

```bash
curl http://localhost:3004/api/weather/Paris
```

**Expected Response**:
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
      },
      // ... 4 more days
    ]
  },
  "cached": false
}
```

**Logs in Terminal 1**:
```
[weather-service] info: Weather request for city: Paris
[weather-service] info: Cache MISS for weather:paris
[weather-service] info: Fetching weather forecast for: Paris
[weather-service] info: Weather forecast retrieved successfully for: Paris
```

✅ **Success Criteria**:
- Status 200
- `cached: false`
- 5 days forecast
- City name "Paris"

---

### Step 4: Test Redis Caching (Second Call - Cached)

**Immediately run again**:
```bash
curl http://localhost:3004/api/weather/Paris
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    // Same data as before
  },
  "cached": true  ⬅️ Notice this changed!
}
```

**Logs in Terminal 1**:
```
[weather-service] info: Cache HIT for weather:paris
```

✅ **Success Criteria**:
- Status 200
- `cached: true`
- **Instant response** (no API call)
- Logs show "Cache HIT"

---

### Step 5: Test Multiple Cities

```bash
# Test different cities
curl http://localhost:3004/api/weather/London
curl http://localhost:3004/api/weather/Tokyo
curl http://localhost:3004/api/weather/New%20York  # Note: %20 for space
curl http://localhost:3004/api/weather/Bucharest

# Test cache for each city (run same commands again)
curl http://localhost:3004/api/weather/London  # Should be cached
```

✅ **Success Criteria**: Each city works independently, each has its own cache

---

### Step 6: Verify Redis Cache Manually

**Terminal 2**:
```bash
# Access Redis CLI
docker exec -it tripmate-redis redis-cli

# Inside Redis CLI:
KEYS weather:*
# Should show: weather:paris, weather:london, weather:tokyo, etc.

# Get cached data for Paris:
GET weather:paris
# Shows JSON data

# Check TTL (time to live - should be ~900 seconds = 15 min):
TTL weather:paris
# Shows remaining seconds

# Exit Redis CLI:
exit
```

✅ **Success Criteria**:
- Keys exist for each city
- TTL is between 0-900 seconds
- Data is valid JSON

---

### Step 7: Test Error Handling

#### Test 1: Invalid City
```bash
curl http://localhost:3004/api/weather/InvalidCityXYZ123
```

**Expected Response** (404):
```json
{
  "error": {
    "message": "City not found",
    "status": 404
  }
}
```

#### Test 2: Missing City Parameter
```bash
curl http://localhost:3004/api/weather/
```

**Expected Response** (404 - route not found):
```json
{
  "error": "Cannot GET /api/weather/"
}
```

---

### Step 8: Performance Testing

**Test cache performance improvement**:

```bash
# First call (no cache) - measure time
time curl -s http://localhost:3004/api/weather/Berlin > /dev/null

# Second call (cached) - measure time
time curl -s http://localhost:3004/api/weather/Berlin > /dev/null
```

✅ **Success Criteria**: Cached call should be **significantly faster** (< 50ms vs ~500ms)

---

## Advanced Testing

### Test Cache Expiration

**Terminal 2**:
```bash
# Connect to Redis
docker exec -it tripmate-redis redis-cli

# Set short TTL for testing (10 seconds):
EXPIRE weather:paris 10

# Exit and wait 10 seconds
exit
sleep 10

# Request Paris again - should fetch fresh data:
curl http://localhost:3004/api/weather/Paris
# cached: false (because cache expired)
```

### Test Redis Failure Handling

```bash
# Stop Redis
docker-compose stop redis

# Try to fetch weather (should still work, but no caching):
curl http://localhost:3004/api/weather/Madrid

# Check logs - should show Redis connection errors but service still works

# Restart Redis
docker-compose start redis
```

### Test Concurrent Requests

```bash
# Fire multiple requests simultaneously:
for i in {1..5}; do
  curl -s http://localhost:3004/api/weather/Amsterdam &
done
wait

# Check logs - first request should cache, others should hit cache
```

---

## Troubleshooting

### Issue: "Cannot connect to Redis"

**Solution**:
```bash
# Check if Redis is running:
docker ps | grep redis

# If not, start it:
docker-compose up -d redis

# Check logs:
docker logs tripmate-redis

# Verify network:
docker network inspect tripmate-network
```

### Issue: "OpenWeatherMap API key not configured"

**Solution**:
```bash
# Check .env file exists:
ls -la services/weather-service/.env

# Verify API key:
cat services/weather-service/.env | grep OPENWEATHER

# If missing, create/update .env file with valid key
```

### Issue: "Port 3004 already in use"

**Solution**:
```bash
# Find process using port:
lsof -i :3004

# Kill process:
kill -9 <PID>

# Or change port in .env:
PORT=3005
```

### Issue: "Module not found" errors

**Solution**:
```bash
# Reinstall dependencies:
cd services/weather-service
rm -rf node_modules package-lock.json
npm install

# Also reinstall shared:
cd ../../shared
rm -rf node_modules package-lock.json
npm install
```

---

## Success Checklist

After testing, verify:

- [ ] ✅ Health endpoint returns 200 OK
- [ ] ✅ Weather endpoint returns forecast data
- [ ] ✅ First request shows `cached: false`
- [ ] ✅ Second request shows `cached: true`
- [ ] ✅ Redis contains cached data with correct TTL
- [ ] ✅ Multiple cities work independently
- [ ] ✅ Invalid city returns 404 error
- [ ] ✅ Cached requests are faster than uncached
- [ ] ✅ Service logs are clear and informative
- [ ] ✅ No crashes or unhandled errors

---

## Quick Test Script

Save as `test-weather.sh`:

```bash
#!/bin/bash

echo "🧪 Testing Weather Service"
echo "=========================="

echo ""
echo "1️⃣ Testing Health Endpoint..."
curl -s http://localhost:3004/api/health | jq '.'

echo ""
echo "2️⃣ Testing Weather - Paris (uncached)..."
curl -s http://localhost:3004/api/weather/Paris | jq '.cached'

echo ""
echo "3️⃣ Testing Weather - Paris (cached)..."
curl -s http://localhost:3004/api/weather/Paris | jq '.cached'

echo ""
echo "4️⃣ Testing Weather - London..."
curl -s http://localhost:3004/api/weather/London | jq '.data.city'

echo ""
echo "5️⃣ Testing Invalid City..."
curl -s http://localhost:3004/api/weather/InvalidCity123 | jq '.error'

echo ""
echo "✅ Tests Complete!"
```

**Run**:
```bash
chmod +x test-weather.sh
./test-weather.sh
```

---

## Next Steps After Successful Testing

1. ✅ Document test results in `PROGRESS.md`
2. 🚀 Implement **Places Service** (similar structure)
3. 🚀 Implement **Currency Service**
4. 🚀 Create **API Gateway** to route to all services
5. 🚀 Deploy to Docker containers

---

**Created**: 2025-12-15
**Service**: Weather Service (Port 3004)
**Status**: Ready for testing
