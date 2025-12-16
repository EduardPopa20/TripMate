# TripMate Microservices

**Status**: ✅ All 7 microservices implemented and containerized
**Last Updated**: 2025-12-15

This directory contains all microservices for the TripMate application.

## Services Overview

### 1. API Gateway (Port 3000)
**Entry point** for all client requests. Handles routing, authentication, and rate limiting.

**Responsibilities**:
- Route requests to appropriate services
- JWT token validation (Supabase Auth)
- Rate limiting
- CORS handling
- Request/response logging

### 2. Trip Service (Port 3001)
**Core business logic** for trip management.

**Responsibilities**:
- Trip CRUD operations
- Date and budget validation
- User ownership verification (RLS)

**Database**: Supabase (`trips` table)

### 3. Itinerary Service (Port 3002)
**Itinerary and attractions** management.

**Responsibilities**:
- Itinerary day CRUD
- Attractions save/management
- Trip association

**Database**: Supabase (`itinerary`, `attractions` tables)

### 4. Budget Service (Port 3003)
**Expense tracking** and budget calculations.

**Responsibilities**:
- Expense CRUD
- Budget summary calculations
- Currency conversion integration
- Daily/total expense reports

**Database**: Supabase (`expenses` table)
**Dependencies**: Currency Service (for conversions)

### 5. Weather Service (Port 3004)
**External API wrapper** for OpenWeatherMap.

**Responsibilities**:
- 5-day weather forecast
- Current weather data
- Redis caching (15min TTL)

**External API**: OpenWeatherMap
**Cache**: Redis (15 minutes)

### 6. Places Service (Port 3005)
**External API wrapper** for Overpass API (OpenStreetMap).

**Responsibilities**:
- Tourist attractions discovery
- Geocoding (Nominatim)
- Category filtering
- Redis caching (24h TTL)

**External API**: Overpass API, Nominatim
**Cache**: Redis (24 hours)

### 7. Currency Service (Port 3006)
**External API wrapper** for ExchangeRate API.

**Responsibilities**:
- Exchange rates
- Currency conversion
- Redis caching (1h TTL)

**External API**: ExchangeRate API (open.er-api.com)
**Cache**: Redis (1 hour)

---

## Service Architecture

```
Client (Frontend)
    ↓
API Gateway (3000)
    ↓
├── Trip Service (3001) ────────→ Supabase
├── Itinerary Service (3002) ───→ Supabase
├── Budget Service (3003) ──────→ Supabase
│   └── calls Currency Service
├── Weather Service (3004) ─────→ Redis → OpenWeatherMap
├── Places Service (3005) ──────→ Redis → Overpass API
└── Currency Service (3006) ────→ Redis → ExchangeRate API
```

---

## Development Setup

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Redis (via Docker)

### Quick Start

1. **Install dependencies for all services**:
```bash
# From TripMate root
for service in services/*/; do
  (cd "$service" && npm install)
done
```

2. **Start Redis**:
```bash
docker-compose up redis -d
```

3. **Start all services** (development):
```bash
# Terminal 1 - API Gateway
cd services/api-gateway && npm run dev

# Terminal 2 - Trip Service
cd services/trip-service && npm run dev

# Terminal 3 - Weather Service
cd services/weather-service && npm run dev

# ... etc
```

4. **Or use Docker Compose** (production-like):
```bash
docker-compose up --build
```

---

## Testing

### Health Checks
```bash
# Gateway health
curl http://localhost:3000/health

# All services health
curl http://localhost:3000/health/services

# Individual service
curl http://localhost:3001/health
```

### API Testing
```bash
# Weather Service
curl http://localhost:3000/api/weather/Paris

# Places Service
curl http://localhost:3000/api/places/London

# Currency Service
curl http://localhost:3000/api/currency/USD/EUR
```

### Run Tests
```bash
# All services
npm test

# Specific service
cd services/trip-service && npm test
```

---

## Environment Variables

Each service requires its own `.env` file. See each service's `.env.example` for required variables.

**Common variables**:
- `PORT` - Service port
- `NODE_ENV` - Environment (development/production)
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key

**External API services**:
- `REDIS_URL` - Redis connection string
- `OPENWEATHER_API_KEY` - For Weather Service
- External API URLs configured in service code

---

## Service Communication

### REST API
Services communicate via HTTP REST APIs. Example:

```javascript
// Budget Service calling Currency Service
const axios = require('axios');

const response = await axios.get(
  `${process.env.CURRENCY_SERVICE_URL}/currency/USD/EUR`
);
```

### Authentication
The API Gateway validates JWT tokens and forwards them to services:

```javascript
// Gateway adds user info to request
req.user = { id: 'user-uuid', email: 'user@example.com' };

// Services receive authenticated requests
const userId = req.user.id;
```

---

## Deployment

### Docker
Each service has a `Dockerfile`. Build and run with:

```bash
# Build all images
docker-compose build

# Start all services
docker-compose up

# Scale specific service
docker-compose up --scale weather-service=3
```

### Cloud Deployment
See `MICROSERVICES_MIGRATION_PLAN.md` for deployment guides:
- Render
- Railway
- AWS ECS
- Kubernetes

---

## Monitoring

### Logs
```bash
# View all logs
docker-compose logs -f

# Specific service
docker-compose logs -f weather-service

# Tail logs
docker-compose logs -f --tail=100
```

### Metrics
- Health endpoints: `/health` on each service
- Aggregated health: `http://localhost:3000/health/services`

---

## Development Guidelines

### Adding a New Service

1. Create directory: `services/my-service/`
2. Copy template from `SERVICE_TEMPLATE/`
3. Update `package.json` with service name
4. Implement routes, controllers, services
5. Add to `docker-compose.yml`
6. Add to API Gateway routes
7. Update this README

### Code Structure (per service)

```
my-service/
├── index.js                # Express server entry point
├── routes/                 # API route definitions
├── controllers/            # Request handlers
├── services/               # Business logic
├── middleware/             # Service-specific middleware
├── tests/                  # Jest tests
├── .env.example            # Environment template
├── package.json
└── Dockerfile
```

---

## Troubleshooting

### Service won't start
1. Check environment variables (`.env` file)
2. Verify port is not in use: `lsof -i :PORT`
3. Check logs: `docker-compose logs service-name`

### Redis connection errors
1. Ensure Redis is running: `docker-compose up redis`
2. Verify `REDIS_URL` environment variable
3. Test connection: `redis-cli ping`

### Inter-service communication fails
1. Check service is running: `curl http://localhost:PORT/health`
2. Verify service URLs in gateway config
3. Check Docker network: `docker network inspect tripmate-network`

---

## Status

**Current Phase**: Phase 2.1 - Infrastructure Setup

See `MICROSERVICES_MIGRATION_PLAN.md` for detailed migration progress.

---

**Last Updated**: 2025-12-15
