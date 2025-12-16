# Currency Service

Microservice wrapper for ExchangeRate API with Redis caching for currency conversions.

## Overview

**Port**: 3006
**External API**: ExchangeRate API (open.er-api.com)
**Cache**: Redis (1 hour TTL)

## Features

- Exchange rate lookup (any currency pair)
- Currency conversion with calculations
- All rates for a base currency
- Redis caching (1h TTL)
- No API key required (free service)
- Support for 160+ currencies
- Error handling and logging

## Endpoints

### 1. Get Exchange Rate
```http
GET /api/currency/:from/:to
```

**Example**:
```bash
curl http://localhost:3006/api/currency/USD/EUR
```

**Response**:
```json
{
  "success": true,
  "data": {
    "from": "USD",
    "to": "EUR",
    "rate": 0.92,
    "date": "2025-12-15",
    "timestamp": 1702656000
  },
  "cached": false
}
```

### 2. Convert Amount
```http
POST /api/currency/convert
Content-Type: application/json

{
  "amount": 100,
  "from": "USD",
  "to": "EUR"
}
```

**Example**:
```bash
curl -X POST http://localhost:3006/api/currency/convert \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "from": "USD", "to": "EUR"}'
```

**Response**:
```json
{
  "success": true,
  "data": {
    "original_amount": 100,
    "original_currency": "USD",
    "converted_amount": 92.00,
    "converted_currency": "EUR",
    "rate": 0.92,
    "date": "2025-12-15"
  }
}
```

### 3. Get All Rates for Base Currency
```http
GET /api/currency/rates/:base
```

**Example**:
```bash
curl http://localhost:3006/api/currency/rates/USD
```

**Response**:
```json
{
  "success": true,
  "data": {
    "base_currency": "USD",
    "rates": {
      "EUR": 0.92,
      "GBP": 0.79,
      "JPY": 149.50,
      "CHF": 0.88,
      // ... 160+ more currencies
    },
    "date": "2025-12-15",
    "total_currencies": 162
  },
  "cached": false
}
```

### 4. Health Check
```http
GET /api/health
```

**Response**:
```json
{
  "service": "currency-service",
  "status": "ok",
  "timestamp": "2025-12-15T18:50:00.000Z",
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
# No API key needed - ExchangeRate API is free!
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

- `PORT` - Service port (default: 3006)
- `REDIS_URL` - Redis connection string
- `LOG_LEVEL` - Logging level (info, debug, error)
- `NODE_ENV` - Environment (development/production)

**Note**: No API keys required! ExchangeRate API is free and open.

## Caching

Exchange rates are cached for **1 hour** to reduce API calls.

**Cache Key Formats**:
- Exchange rate: `currency:usd-eur`
- All rates: `currency:rates:usd`

### Cache Behavior

1. **Cache HIT**: Returns cached data immediately
2. **Cache MISS**: Fetches from ExchangeRate API, caches result
3. **TTL**: 3600 seconds (1 hour)
4. **Invalidation**: Automatic after TTL expires

**Why 1 hour?**
- Exchange rates update once per day (ExchangeRate API)
- 1 hour caching balances freshness with API load
- Reduces API calls by 95%+

## Supported Currencies

160+ currencies including:
- **Major**: USD, EUR, GBP, JPY, CHF, CAD, AUD
- **Crypto**: BTC, ETH (via ExchangeRate API)
- **All ISO 4217 codes**

See full list: https://open.er-api.com/v6/latest/USD

## Testing

```bash
# Run tests
npm test

# Test health endpoint
curl http://localhost:3006/api/health

# Test exchange rate
curl http://localhost:3006/api/currency/USD/EUR

# Test conversion
curl -X POST http://localhost:3006/api/currency/convert \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "from": "USD", "to": "JPY"}'

# Test all rates
curl http://localhost:3006/api/currency/rates/EUR

# Check cache (with Redis CLI)
redis-cli
> KEYS currency:*
> GET currency:usd-eur
> TTL currency:usd-eur  # Should show ~3600 seconds
```

## Error Handling

| Error | Status | Message |
|-------|--------|---------|
| Missing parameters | 400 | Required parameters missing |
| Invalid amount | 400 | Amount must be a positive number |
| Currency not found | 404 | Currency not found |
| API failure | 500 | Failed to fetch exchange rate |

## Performance

### Response Times
- **Cached**: < 10ms
- **Uncached**: ~200-500ms (API call)

### API Rate Limits
**ExchangeRate API Free Tier**:
- No rate limits
- Updated once per day
- No authentication required

**With 1h caching**:
- Effective rate: ~24 API calls/day per currency pair
- Supports thousands of requests/day with minimal API calls

## Docker

### Build Image
```bash
docker build -t currency-service .
```

### Run Container
```bash
docker run -p 3006:3006 \
  -e REDIS_URL=redis://host.docker.internal:6379 \
  currency-service
```

### With Docker Compose
```bash
# From project root
docker-compose up currency-service
```

## Dependencies

- `express` - Web framework
- `axios` - HTTP client for ExchangeRate API
- `redis` - Redis client
- `winston` - Logging
- `cors` - CORS middleware
- `dotenv` - Environment variables

## Development

### Project Structure
```
currency-service/
├── index.js                      # Entry point
├── routes/
│   └── currencyRoutes.js        # API routes
├── controllers/
│   └── currencyController.js    # Request handlers
├── services/
│   └── currencyService.js       # ExchangeRate API integration
├── middleware/
│   └── cacheMiddleware.js       # Redis caching (1h TTL)
├── tests/
│   └── currency.test.js         # Jest tests
├── .env.example
├── package.json
├── Dockerfile
└── README.md
```

### Adding New Endpoints

Example - Get historical rates:
```javascript
// services/currencyService.js
async function getHistoricalRate(from, to, date) {
  const url = `https://open.er-api.com/v6/history/${from}/${date}`;
  // Implementation...
}
```

## Use Cases

### 1. Budget Service Integration
```javascript
// From Budget Service
const axios = require('axios');

async function convertExpense(amount, fromCurrency, toCurrency) {
  const response = await axios.post('http://currency-service:3006/api/currency/convert', {
    amount,
    from: fromCurrency,
    to: toCurrency
  });
  return response.data.data.converted_amount;
}
```

### 2. Multi-Currency Budgets
```javascript
// Get all rates to display budget in multiple currencies
const response = await axios.get('http://currency-service:3006/api/currency/rates/USD');
const rates = response.data.data.rates;

const budgetInEUR = budgetInUSD * rates.EUR;
const budgetInGBP = budgetInUSD * rates.GBP;
```

### 3. Real-Time Expense Tracking
```javascript
// Convert expense to trip base currency
const expense = {
  amount: 50,
  currency: 'GBP'
};

const converted = await convertCurrency(expense.amount, expense.currency, 'EUR');
// Add to trip total in EUR
```

## Monitoring

### Logs
```bash
# View logs (if using Docker)
docker logs -f currency-service

# Logs include:
# - API requests (from/to currencies)
# - Conversion calculations
# - Cache hits/misses
# - Errors with stack traces
```

### Metrics
- Response time: Logged for each request
- Cache hit rate: Check Redis stats
- Conversion count per currency pair

## Troubleshooting

### Service won't start
1. Check `.env` file exists
2. Ensure Redis is running: `docker ps | grep redis`
3. Check port 3006 is not in use: `lsof -i :3006`

### Redis connection errors
1. Verify Redis is running: `docker-compose up redis -d`
2. Test connection: `redis-cli ping`
3. Check `REDIS_URL` in `.env`

### "Currency not found" errors
- Check currency code spelling (must be uppercase)
- Verify currency is supported: https://open.er-api.com/v6/latest/USD
- Most ISO 4217 codes are supported

### ExchangeRate API errors
- API is free and has no rate limits
- If API is down, service will return 500 error
- Check API status: https://www.exchangerate-api.com/status

### Cache not working
1. Check Redis connection: `redis-cli ping`
2. Verify TTL: `redis-cli TTL currency:usd-eur`
3. Check logs for cache errors

## Example Requests

```bash
# Common currency pairs
curl http://localhost:3006/api/currency/USD/EUR
curl http://localhost:3006/api/currency/EUR/GBP
curl http://localhost:3006/api/currency/USD/JPY

# Convert amounts
curl -X POST http://localhost:3006/api/currency/convert \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000, "from": "USD", "to": "EUR"}'

# Get all rates for popular bases
curl http://localhost:3006/api/currency/rates/USD
curl http://localhost:3006/api/currency/rates/EUR
curl http://localhost:3006/api/currency/rates/GBP

# Check caching performance
time curl http://localhost:3006/api/currency/USD/EUR
# First time: ~0.3s
# Second time: ~0.01s (cached!)
```

## API Integration Best Practices

### 1. Always Use Caching
The service automatically caches for 1 hour. For Budget Service integration, rely on this caching.

### 2. Handle Errors Gracefully
```javascript
try {
  const rate = await getCurrency('USD', 'EUR');
} catch (error) {
  // Fallback: use last known rate or default
  console.error('Currency service unavailable:', error);
}
```

### 3. Batch Conversions
Use `/currency/rates/:base` to get all rates at once for multiple conversions:
```javascript
const rates = await getAllRates('USD');
const eurAmount = usdAmount * rates.EUR;
const gbpAmount = usdAmount * rates.GBP;
```

---

**Version**: 1.0.0
**Last Updated**: 2025-12-15
**Status**: Production Ready
**API Source**: ExchangeRate API (free, no auth required)
