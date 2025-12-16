# Docker Deployment Guide - TripMate Microservices

**Last Updated**: 2025-12-15
**Docker Compose Version**: 3.8

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Environment Setup](#environment-setup)
4. [Build & Run](#build--run)
5. [Service Management](#service-management)
6. [Monitoring & Logs](#monitoring--logs)
7. [Troubleshooting](#troubleshooting)
8. [Production Deployment](#production-deployment)

---

## 🔧 Prerequisites

### Required Software
- **Docker**: Version 20.10+ ([Install Docker](https://docs.docker.com/get-docker/))
- **Docker Compose**: Version 2.0+ (included with Docker Desktop)
- **Git**: For cloning the repository

### Verify Installation
```bash
docker --version
# Docker version 24.0.0 or higher

docker compose version
# Docker Compose version v2.20.0 or higher
```

---

## 🚀 Quick Start

### 1. Clone Repository
```bash
cd TripMate
```

### 2. Configure Environment
```bash
# Copy environment template
cp .env.docker.example .env

# Edit .env with your credentials
nano .env
```

**Required Variables**:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
OPENWEATHER_API_KEY=your_openweather_api_key
```

### 3. Start All Services
```bash
# Build and start all services
docker compose up --build

# OR run in detached mode (background)
docker compose up -d --build
```

### 4. Verify Services
```bash
# Check all services are running
docker compose ps

# Check health status
curl http://localhost:3000/health | jq .
```

**Expected Output**:
```json
{
  "status": "healthy",
  "gateway": {
    "name": "api-gateway",
    "status": "healthy"
  },
  "services": [...],
  "summary": {
    "total": 6,
    "healthy": 6,
    "unhealthy": 0
  }
}
```

---

## ⚙️ Environment Setup

### Environment Variables

**Required for Core Services** (Trip, Itinerary, Budget, API Gateway):
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

**Required for Weather Service**:
```env
OPENWEATHER_API_KEY=your_api_key_here
```

**Optional Configuration**:
```env
# CORS Origin (default: http://localhost:5173)
CORS_ORIGIN=http://localhost:5173

# Rate Limiting (default: 100 requests per 15 minutes)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Getting API Keys

1. **Supabase**:
   - Go to https://supabase.com
   - Create a project
   - Navigate to Settings → API
   - Copy `URL` and `anon/public` key

2. **OpenWeatherMap**:
   - Go to https://openweathermap.org/api
   - Sign up for free tier
   - Copy API key from account dashboard

---

## 🏗️ Build & Run

### Build All Services
```bash
# Build all Docker images
docker compose build

# Build with no cache (clean build)
docker compose build --no-cache

# Build specific service
docker compose build weather-service
```

### Start Services
```bash
# Start all services (foreground)
docker compose up

# Start in background (detached mode)
docker compose up -d

# Start specific services
docker compose up redis weather-service currency-service

# Start with build
docker compose up --build
```

### Stop Services
```bash
# Stop all services (keeps containers)
docker compose stop

# Stop and remove containers
docker compose down

# Stop and remove containers + volumes
docker compose down -v

# Stop and remove containers + images
docker compose down --rmi all
```

---

## 🔄 Service Management

### Check Service Status
```bash
# List all containers
docker compose ps

# Check logs
docker compose logs

# Follow logs (real-time)
docker compose logs -f

# Logs for specific service
docker compose logs -f api-gateway
docker compose logs -f weather-service
```

### Restart Services
```bash
# Restart all services
docker compose restart

# Restart specific service
docker compose restart api-gateway
docker compose restart redis
```

### Scale Services
```bash
# Scale a service to multiple instances
docker compose up --scale weather-service=3

# Note: Requires removing port mapping from docker-compose.yml
```

### Update a Single Service
```bash
# Rebuild and restart one service
docker compose up -d --build --no-deps weather-service

# --no-deps: Don't recreate dependent services
```

---

## 📊 Monitoring & Logs

### View Logs
```bash
# All services
docker compose logs

# Last 100 lines
docker compose logs --tail=100

# Follow logs (Ctrl+C to exit)
docker compose logs -f

# Specific service with timestamps
docker compose logs -f --timestamps api-gateway

# Multiple services
docker compose logs -f api-gateway trip-service
```

### Check Service Health
```bash
# API Gateway health (includes all services)
curl http://localhost:3000/health | jq .

# Individual service health
curl http://localhost:3001/api/health  # Trip Service
curl http://localhost:3002/api/health  # Itinerary Service
curl http://localhost:3003/api/health  # Budget Service
curl http://localhost:3004/api/health  # Weather Service
curl http://localhost:3005/api/health  # Places Service
curl http://localhost:3006/api/health  # Currency Service

# Redis health
docker compose exec redis redis-cli ping
# Expected: PONG
```

### Resource Usage
```bash
# View resource usage
docker stats

# Specific containers
docker stats tripmate-api-gateway tripmate-redis
```

### Network Inspection
```bash
# List networks
docker network ls

# Inspect tripmate network
docker network inspect tripmate-network

# Test connectivity between containers
docker compose exec api-gateway ping trip-service
docker compose exec api-gateway wget -qO- http://weather-service:3004/api/health
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Port Already in Use
**Error**: `Bind for 0.0.0.0:3000 failed: port is already allocated`

**Solution**:
```bash
# Find process using port
lsof -ti :3000

# Kill the process
kill -9 $(lsof -ti :3000)

# Or change port in docker-compose.yml
ports:
  - "3001:3000"  # Host:Container
```

#### 2. Service Unhealthy
**Error**: Service shows as unhealthy in health check

**Solution**:
```bash
# Check service logs
docker compose logs service-name

# Check if service is responding
docker compose exec service-name wget -qO- http://localhost:PORT/api/health

# Restart service
docker compose restart service-name

# Rebuild service
docker compose up -d --build --no-deps service-name
```

#### 3. Redis Connection Failed
**Error**: `Error: Redis connection to redis:6379 failed`

**Solution**:
```bash
# Check Redis is running
docker compose ps redis

# Check Redis logs
docker compose logs redis

# Test Redis connection
docker compose exec redis redis-cli ping

# Restart Redis
docker compose restart redis
```

#### 4. Environment Variables Not Loaded
**Error**: `SUPABASE_URL is not defined`

**Solution**:
```bash
# Verify .env file exists
ls -la .env

# Check environment variables in container
docker compose exec api-gateway env | grep SUPABASE

# Recreate containers with new env vars
docker compose up -d --force-recreate
```

#### 5. Build Cache Issues
**Error**: Old code still running after changes

**Solution**:
```bash
# Clean build (no cache)
docker compose build --no-cache

# Remove all containers and rebuild
docker compose down
docker compose up --build
```

### Debug Mode

**Enable verbose logging**:
```bash
# Edit .env
LOG_LEVEL=debug

# Restart services
docker compose up -d --force-recreate
```

**Access container shell**:
```bash
# Open shell in running container
docker compose exec api-gateway sh

# Run commands inside container
docker compose exec api-gateway npm list
docker compose exec api-gateway ls -la /app
```

---

## 🚀 Production Deployment

### Production Configuration

1. **Update docker-compose.yml**:
```yaml
environment:
  - NODE_ENV=production
  - LOG_LEVEL=warn  # Reduce logging
```

2. **Security Best Practices**:
```bash
# Use secrets instead of .env file
docker secret create supabase_url /path/to/supabase_url.txt

# Limit resource usage
services:
  api-gateway:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

3. **Enable HTTPS** (use Nginx reverse proxy):
```yaml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./certs:/etc/nginx/certs
```

### Backup & Recovery

**Backup Redis data**:
```bash
# Backup
docker compose exec redis redis-cli SAVE
docker cp tripmate-redis:/data/dump.rdb ./backups/redis-$(date +%Y%m%d).rdb

# Restore
docker cp ./backups/redis-backup.rdb tripmate-redis:/data/dump.rdb
docker compose restart redis
```

### Monitoring

**Recommended Tools**:
- **Prometheus** + **Grafana**: Metrics & dashboards
- **ELK Stack**: Centralized logging
- **Datadog** / **New Relic**: APM & monitoring

---

## 📝 Service Architecture

### Container Network
```
tripmate-network (bridge)
├── redis (6379)
├── trip-service (3001)
├── itinerary-service (3002)
├── budget-service (3003) → currency-service
├── weather-service (3004) → redis
├── places-service (3005) → redis
├── currency-service (3006) → redis
└── api-gateway (3000) → all services
```

### Health Check Strategy
- **Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Retries**: 3 attempts
- **Start Period**: 40-60 seconds (allows service startup)

### Dependency Order
1. **Redis** starts first (no dependencies)
2. **External API services** start after Redis
3. **Core business services** start after Redis
4. **API Gateway** starts last (depends on all services)

---

## 🎯 Common Commands Cheat Sheet

```bash
# Start everything
docker compose up -d

# Stop everything
docker compose down

# View logs
docker compose logs -f

# Rebuild service
docker compose up -d --build service-name

# Check health
curl http://localhost:3000/health | jq .

# Enter container
docker compose exec service-name sh

# View resource usage
docker stats

# Clean everything
docker compose down -v --rmi all
docker system prune -a
```

---

## 🔗 URLs

**Production URLs** (all accessible from host):
- API Gateway: http://localhost:3000
- Trip Service: http://localhost:3001
- Itinerary Service: http://localhost:3002
- Budget Service: http://localhost:3003
- Weather Service: http://localhost:3004
- Places Service: http://localhost:3005
- Currency Service: http://localhost:3006
- Redis: localhost:6379

**Internal URLs** (container-to-container):
- Trip Service: http://trip-service:3001
- Weather Service: http://weather-service:3004
- Redis: redis:6379

---

**Status**: Ready for production deployment
**Last Updated**: 2025-12-15
**Docker Compose Version**: 3.8
