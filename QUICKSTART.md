# TripMate Microservices - Quick Start Guide

**Get the full system running in 5 minutes!**

---

## 📋 Prerequisites

- **Docker Desktop** installed and running
- **Git** (to clone the repository)
- **API Keys**:
  - Supabase account (free tier)
  - OpenWeatherMap API key (free tier)

---

## 🚀 Quick Start (5 Steps)

### Step 1: Clone & Navigate
```bash
cd TripMate
```

### Step 2: Configure Environment
```bash
# Copy environment template
cp .env.docker.example .env

# Edit with your credentials
nano .env
```

**Add your credentials**:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
OPENWEATHER_API_KEY=your_openweather_api_key_here
```

### Step 3: Start All Services
```bash
# Build and start all 8 containers
docker compose up -d --build
```

**Expected Output**:
```
[+] Running 8/8
 ✔ Container tripmate-redis              Started
 ✔ Container tripmate-weather-service    Started
 ✔ Container tripmate-places-service     Started
 ✔ Container tripmate-currency-service   Started
 ✔ Container tripmate-trip-service       Started
 ✔ Container tripmate-itinerary-service  Started
 ✔ Container tripmate-budget-service     Started
 ✔ Container tripmate-api-gateway        Started
```

### Step 4: Verify System Health
```bash
# Wait 60 seconds for all services to start
sleep 60

# Check health status
curl http://localhost:3000/health | jq '.summary'
```

**Expected Output**:
```json
{
  "total": 6,
  "healthy": 6,
  "unhealthy": 0
}
```

### Step 5: Test API
```bash
# Test weather service through API Gateway
curl "http://localhost:3000/api/weather/Paris" | jq '.data.city'

# Expected: "Paris"
```

---

## ✅ Success! Your microservices are running!

**Access Points**:
- **API Gateway**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **Weather API**: http://localhost:3000/api/weather/:city
- **Places API**: http://localhost:3000/api/places/:city
- **Currency API**: http://localhost:3000/api/currency/convert

---

## 🛑 Stop Services

```bash
# Stop all services
docker compose down

# Stop and remove volumes (clean slate)
docker compose down -v
```

---

## 📊 View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f api-gateway
docker compose logs -f weather-service
```

---

## 🔧 Troubleshooting

### Services not starting?
```bash
# Check Docker is running
docker --version

# Check logs
docker compose logs

# Rebuild
docker compose down
docker compose up --build -d
```

### Port already in use?
```bash
# Kill process on port 3000
lsof -ti :3000 | xargs kill -9

# Restart
docker compose up -d
```

### Health check failing?
```bash
# Check individual service
docker compose ps
docker compose logs service-name

# Restart specific service
docker compose restart service-name
```

---

## 📚 Next Steps

1. **Read Full Documentation**: See `DOCKER_DEPLOYMENT.md`
2. **Understand Architecture**: See `MICROSERVICES_COMPLETE.md`
3. **API Documentation**: See service-specific READMEs in `/services`
4. **Development Guide**: See `MICROSERVICES_MIGRATION_PLAN.md`

---

## 🎯 Common Commands

```bash
# Start everything
docker compose up -d

# Stop everything
docker compose down

# View logs
docker compose logs -f

# Check status
docker compose ps

# Rebuild specific service
docker compose up -d --build service-name

# Health check
curl http://localhost:3000/health | jq .
```

---

**Time to Full System**: ~90 seconds
**Services Running**: 8 containers (7 microservices + Redis)
**Memory Usage**: ~400MB total

🎉 **Enjoy your microservices architecture!**
