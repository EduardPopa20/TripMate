# TripMate - Mini Travel Planner

A modern city-break planner with integrated weather forecasts, attractions discovery, itinerary building, and budget tracking.

## 🚀 Features

### Core Features
- **Trip Management**: Create and manage city-break trips
- **Weather Forecast**: 5-day weather forecast for your destination
- **Attractions Discovery**: Search and filter museums, restaurants, cafes, and historic sites
- **Interactive Calendar**: Visual calendar for itinerary and budget management
- **Smart Caching**: Optimized API calls with intelligent caching

### Authentication & Security
- **User Authentication**: Email/password + Google OAuth login
- **Protected Routes**: Secure access to trip data
- **Row Level Security (RLS)**: Multi-tenant data isolation
- **Modern Auth UI**: Gradient backgrounds, glassmorphism design

### Itinerary Management
- **Calendar View**: Interactive calendar with highlighted trip dates
- **Day-by-Day Planning**: Click any day to add/edit activities
- **Multi-Month Navigation**: Seamlessly browse across months
- **Activity Management**: Add, view, and delete activities per day

### Budget & Expense Tracking
- **Calendar-Based Expenses**: Visual calendar for expense management
- **Category Tracking**: Food, Transport, Accommodation, Activities, Shopping, Other
- **Real-Time Budget**: Live budget remaining calculation
- **Expense Details**: View all expenses per day with category chips
- **Quick Add/Delete**: Easy expense management interface

### Attractions
- **Smart Search**: Real-time search within selected categories
- **Category Filtering**: Filter by type (hotels, cafes, ruins, monuments, etc.)
- **Formatted Labels**: Clean display (e.g., "wayside_shrine" → "Wayside Shrine")

## 🛠 Tech Stack

- **Frontend**: React 18 + Vite + Material-UI
- **Backend**: Node.js + Express
- **Database**: Supabase (PostgreSQL)
- **External APIs**: OpenWeatherMap, Overpass API, ExchangeRate

## 📦 Installation

### Prerequisites

- Node.js 18+
- Supabase account
- OpenWeatherMap API key (free tier)

### Setup

1. **Clone the repository**
   ```bash
   cd TripMate
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your credentials
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env with your API URL
   npm run dev
   ```

4. **Database Setup**
   - Create Supabase project at https://supabase.com
   - Run SQL migrations from `backend/database/` directory:
     - `expenses_table.sql` - Creates expenses table
     - `add_user_authentication.sql` - Adds user_id columns and RLS policies
   - Update `.env` files with Supabase credentials
   - Enable Email authentication in Supabase Dashboard

5. **Get API Keys**
   - OpenWeatherMap: https://openweathermap.org/api
   - Add to `backend/.env` as `OPENWEATHER_API_KEY`

## 🎯 Usage

1. **Start Backend**: `cd backend && npm run dev` (Port 3000)
2. **Start Frontend**: `cd frontend && npm run dev` (Port 5173)
3. Open http://localhost:5173 in your browser

## 📱 User Flow

### First Time User
1. **Register**: Create account with email/password or Google OAuth
2. **Login**: Access your personalized dashboard
3. **Create Trip**: Click "New Trip" → Fill in destination, dates, budget

### Trip Management
4. **View Details**: Click on trip → See weather, attractions, itinerary
5. **Browse Attractions**: Search and filter by category, add to trip
6. **Plan Itinerary**:
   - Click calendar days to view/edit activities
   - Navigate between months to see entire trip
   - Add/delete activities per day
7. **Track Budget**:
   - Click calendar days to view/add expenses
   - See total spent vs budget remaining
   - Manage expenses with category tags
8. **Logout**: Secure sign out from profile menu

## 📐 Architecture

### Monolithic (Phase 1 - Current)
```
Frontend (React) → Backend (Express) → Supabase + External APIs
```

**Current Stats**:
- Backend: ~877 lines of code (20 files)
- Frontend: ~3,187 lines of code (30+ components)
- Total: ~4,064 lines across 50+ files

### Microservices (Phase 2 - Planned)

**Target Architecture**:
```
                    ┌─────────────────────┐
                    │   API GATEWAY       │
                    │  (Port 3000)        │
                    │  • Auth • Routing   │
                    └──────────┬──────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   ┌────▼────┐          ┌────▼────┐          ┌────▼────┐
   │  TRIP   │          │ WEATHER │          │ PLACES  │
   │ SERVICE │          │ SERVICE │          │ SERVICE │
   │  :3001  │          │  :3004  │          │  :3005  │
   └────┬────┘          └────┬────┘          └────┬────┘
        │                    │                     │
   ┌────▼────┐          ┌────▼─────────────────────▼────┐
   │ITINERARY│          │         REDIS CACHE            │
   │ SERVICE │          │  • Weather (15min)             │
   │  :3002  │          │  • Places (24h)                │
   └────┬────┘          │  • Currency (1h)               │
        │               └────────────────────────────────┘
   ┌────▼────┐          ┌────▼────┐
   │ BUDGET  │          │CURRENCY │
   │ SERVICE │          │ SERVICE │
   │  :3003  │          │  :3006  │
   └────┬────┘          └─────────┘
        │
   ┌────▼──────────────────────────┐
   │    SUPABASE (PostgreSQL)      │
   │  • trips  • itinerary         │
   │  • expenses • attractions     │
   └───────────────────────────────┘
```

**7 Microservices** (Target):
1. **API Gateway** (Port 3000) - Routing, Auth, Rate Limiting
2. **Trip Service** (Port 3001) - Trip CRUD + Business Logic
3. **Itinerary Service** (Port 3002) - Itinerary & Attractions Management
4. **Budget Service** (Port 3003) - Expenses & Budget Tracking
5. **Weather Service** (Port 3004) - OpenWeatherMap Wrapper + Redis Cache
6. **Places Service** (Port 3005) - Overpass API Wrapper + Redis Cache
7. **Currency Service** (Port 3006) - ExchangeRate API Wrapper + Redis Cache

**Key Changes**:
- ✅ In-memory cache → **Redis** (persistent, scalable)
- ✅ Monolith → **Independent services** (deploy separately)
- ✅ Single point of failure → **Resilient architecture**
- ✅ Direct Supabase access → **Service abstraction layer**

## 🧪 Testing

```bash
# Backend
cd backend
npm start

# Test health endpoint
curl http://localhost:3000/health

# Frontend
cd frontend
npm run build
npm run preview
```

## 📚 Documentation

### Getting Started
- **QUICKSTART.md**: 🚀 Get the system running in 5 minutes!
- **DOCKER_DEPLOYMENT.md**: Complete Docker deployment guide

### Microservices Architecture
- **MICROSERVICES_COMPLETE.md**: Migration summary & architecture overview
- **MICROSERVICES_MIGRATION_PLAN.md**: Detailed implementation plan (1,700 lines)
- **services/README.md**: Services directory overview

### Development
- **CLAUDE.md**: Complete development guide
- **UI_DESIGN.md**: Design system and component guidelines
- **TODO.md**: Development roadmap and task tracking

### Phase Summaries
- **services/PHASE_2.2_SUMMARY.md**: External API services
- **services/PHASE_2.3_SUMMARY.md**: Core business services
- **services/PHASE_2.4_SUMMARY.md**: API Gateway
- **services/PHASE_2.5_SUMMARY.md**: Containerization

## 🔮 Roadmap

### Phase 1.5 (✅ Complete - Current)
- ✅ Backend API with caching
- ✅ All frontend pages and components
- ✅ Trip CRUD operations
- ✅ Weather, attractions, itinerary, budget features
- ✅ Expense tracking with categories and daily breakdown
- ✅ **User Authentication** (Supabase Auth with email/password + Google OAuth)
- ✅ **Calendar-Based UI** for itinerary and budget management
- ✅ **Smart Search** for attractions with category filtering
- ✅ **Row Level Security** for multi-tenant data isolation
- ✅ **Modern Auth Design** (gradient backgrounds, glassmorphism)
- ✅ **Interactive Calendars** with highlighted trip dates

### Phase 2 (🚧 In Progress - Microservices Migration)

**Migration Plan**: 6-week implementation divided into 6 phases

#### Phase 2.1: Infrastructure Setup (Week 1) - ✅ COMPLETED
- [x] Create `/services` directory structure (7 service directories)
- [x] Setup Redis container (Docker - docker-compose.yml)
- [x] Create `/shared` utilities (logger, error handler, Supabase config, Redis client)
- [x] Document API contracts between services (services/README.md)
- [x] Setup base `package.json` templates for each service
- [x] **Weather Service implemented** (first microservice operational)

#### Phase 2.2: External API Services (Week 2) - ✅ COMPLETED
- [x] **Weather Service** - OpenWeatherMap wrapper with Redis cache (Port 3004) ✅
- [x] **Places Service** - Overpass API wrapper with Redis cache (Port 3005) ✅
- [x] **Currency Service** - ExchangeRate API wrapper with Redis cache (Port 3006) ✅
- [x] All services fully documented with comprehensive READMEs
- [x] Dockerfiles created for all services
- [ ] Unit tests (optional - to be added later)
- [x] Standalone testing ready (each service can run independently)

#### Phase 2.3: Core Business Services (Week 3) - ✅ COMPLETED
- [x] **Trip Service** (Port 3001) - Trip CRUD with user isolation ✅
- [x] **Itinerary Service** (Port 3002) - Itinerary/attractions management ✅
- [x] **Budget Service** (Port 3003) - Expenses + Currency Service integration ✅
- [x] Integration tests for inter-service communication ✅

**Progress**: 3/3 services complete - All operational!
**Results**: See `services/PHASE_2.3_TEST_RESULTS.md` for test results and inter-service communication validation

#### Phase 2.4: API Gateway (Week 4) - ✅ COMPLETED
- [x] Implement API Gateway with routing to all services ✅
- [x] JWT authentication middleware (Supabase token validation) ✅
- [x] Rate limiting (express-rate-limit) ✅
- [x] CORS configuration ✅
- [x] Request logging and error handling ✅
- [x] Health check endpoints for all services ✅

**Progress**: API Gateway operational on Port 3000
**Features**: JWT auth, rate limiting, proxy routing, aggregated health checks

#### Phase 2.5: Containerization (Week 5) - ✅ COMPLETED
- [x] Create Dockerfile for each service ✅
- [x] Create docker-compose.yml for all services ✅
- [x] Configure networking between containers ✅
- [x] Setup environment variable management ✅
- [x] Document deployment process ✅

**Progress**: Full system containerized with Docker Compose
**Features**: 8 services (7 microservices + Redis), health checks, networking, volumes
**Documentation**: See `DOCKER_DEPLOYMENT.md` for complete deployment guide

#### Phase 2.6: Testing & Documentation (Week 6)
- [ ] End-to-end testing across all services
- [ ] Performance benchmarking (monolith vs microservices)
- [ ] API documentation (Swagger/OpenAPI for each service)
- [ ] Architecture diagrams (draw.io)
- [ ] Update frontend to use API Gateway endpoint
- [ ] Migration guide documentation

#### Phase 2.7: Future Enhancements (Post-Migration)
- [ ] Map integration (Google Maps / Leaflet)
- [ ] Drag-and-drop itinerary reordering
- [ ] Dark mode
- [ ] Export itinerary as PDF
- [ ] Social sharing
- [ ] Push notifications for trip reminders
- [ ] Offline mode with sync
- [ ] Message queue (RabbitMQ) for async operations
- [ ] Monitoring dashboard (Grafana + Prometheus)
- [ ] CI/CD pipeline (GitHub Actions)

## 🤝 Contributing

This is a university project (IMS 2025). For questions or issues, please contact the development team.

## 📄 License

ISC

## 👥 Team

Developed for IMS 2025 Milestone Project

---

**Status**: 🚧 Phase 2.5 Complete - Full System Containerized
**Progress**: Phase 2.1 ✅ | Phase 2.2 ✅ | Phase 2.3 ✅ | Phase 2.4 ✅ | Phase 2.5 ✅
**Last Updated**: 2025-12-15
