# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TripMate is a mini travel planner for city-breaks that integrates multiple external services (weather, places, currency). Users can create trips, view weather forecasts, browse attractions, build itineraries, and manage daily budgets.

**Current Phase**: Phase 1.5 Complete - Authentication + Enhanced Calendar UI
**Completed**: Phase 1 (Milestone 1) + User Authentication + Calendar-Based UI
**Future Phase**: Microservices migration (Phase 2)

## Tech Stack

- **Frontend**: React 18 + Vite + Material-UI (MUI)
- **Backend**: Node.js + Express
- **Database**: Supabase (PostgreSQL)
- **External APIs**: OpenWeatherMap, Overpass API, exchangerate.host
- **Cache**: In-memory (node-cache) - 15min for weather, 24h for places

## Architecture

```
frontend/          React SPA with MUI components
backend/
  ├── controllers/ Route handlers (trip, weather, places, currency, itinerary)
  ├── services/    Business logic + external API integrations
  ├── models/      Supabase client (models/supabase.js)
  ├── middleware/  Cache middleware (15min weather, 24h places, 1h currency)
  ├── routes/      API route definitions (routes/index.js)
  └── utils/       Helper functions
```

**Backend Status**: ✅ Complete (all services, controllers, routes implemented)

**Frontend Status**: ✅ Complete (all pages and components implemented + UI enhancements)
- ✅ MUI theme and responsive layout
- ✅ API client setup
- ✅ HomePage (trip list)
- ✅ CreateTripPage (new trip form)
- ✅ TripDetailsPage (weather/attractions/itinerary tabs)
- ✅ Weather cards component (equal width flexbox layout)
- ✅ Attractions list component with smart search and category filtering
- ✅ Formatted labels for attractions (e.g., 'wayside_shrine' → 'Wayside Shrine')
- ✅ ItineraryCalendar component (interactive calendar with highlighted trip dates)
- ✅ BudgetCalendar component (calendar-based expense management)
- ✅ Expense management with categories (Food, Transport, Accommodation, Activities, Shopping, Other)
- ✅ User authentication (Login/Register pages with gradient backgrounds and glassmorphism)
- ✅ Protected routes and user profile dropdown with initials avatar
- ✅ Row Level Security (RLS) policies for multi-tenant data isolation
- ✅ Direct Supabase client integration in frontend (no backend API for data operations)
- ✅ Layout fixes (flexible height, no overflow into footer)
- ✅ Chip styling (filled variant with white text)

## Database Schema (Supabase)

**trips**: id, city, country, start_date, end_date, budget_total, user_id, created_at
**itinerary**: id, trip_id, user_id, day_number, date, activities (JSONB), budget_day, created_at
**attractions**: id, trip_id, user_id, name, lat, lon, type, visited, created_at
**expenses**: id, trip_id, user_id, day_number, category, description, amount, currency, created_at

**All tables have user_id foreign key referencing auth.users(id) with CASCADE delete**

**Authentication**: ✅ Implemented with Supabase Auth
- User registration and login (email/password + Google OAuth)
- Row Level Security (RLS) policies on all tables
- JWT-based authentication with protected routes
- User-specific data isolation

## Development Commands

### Backend
```bash
cd backend
npm install
npm run dev        # Start Express server with nodemon
npm start          # Production server
```

### Frontend
```bash
cd frontend
npm install
npm run dev        # Start Vite dev server
npm run build      # Production build
npm run preview    # Preview production build
```

## Environment Variables

### Backend `.env`
```
PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
OPENWEATHER_API_KEY=your_openweather_key
```

### Frontend `.env`
```
VITE_API_URL=http://localhost:3000/api
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## API Endpoints

- `POST /api/trips` - Create new trip
- `GET /api/trips` - List all trips
- `GET /api/trips/:id` - Get trip details with itinerary
- `GET /api/weather/:city` - Fetch weather forecast (cached 15min)
- `GET /api/places/:city` - Fetch attractions (cached 24h)
- `POST /api/itinerary` - Add day to itinerary
- `GET /api/currency/:from/:to` - Get exchange rate
- `POST /api/expenses` - Create expense
- `GET /api/expenses/:tripId` - List all expenses for trip
- `GET /api/expenses/:tripId/day/:dayNumber` - Get expenses for specific day
- `GET /api/expenses/:tripId/total` - Get total expenses for trip
- `DELETE /api/expenses/:id` - Delete expense

## External API Integration

**OpenWeatherMap**: 5-day forecast with 3-hour intervals. Free tier: 60 calls/min. Real data integration active (no mock fallback).
**Overpass API**: Query for tourism, museums, restaurants by city. No rate limit but slow - cache aggressively.
**ExchangeRate API**: Currency conversion via open.er-api.com. Free, no key required.

All external API calls go through `backend/services/` with error handling and caching.

## Code Conventions

- Use **async/await** for all async operations
- Material-UI components: import from `@mui/material`
- Date handling: use `date-fns` library
- Error responses: `{ error: "message" }` with appropriate HTTP status
- Success responses: `{ data: {...} }`

## UI/UX Design Guidelines

**See [UI_DESIGN.md](./UI_DESIGN.md) for complete design system.**

Key principles:
- **Card-based layout** for all content (weather, attractions, itineraries)
- **Color palette**: Primary blue (#1976d2), Secondary orange (#ff9800), Natural tones
- **Mobile-first responsive design** with Material-UI Grid system
- **Minimalist approach** - prioritize clarity over feature overload
- Inspired by TripIt, Hopper, and Airbnb UI patterns

## Caching Strategy

The in-memory cache middleware prevents excessive API calls:
- Weather data: 15 minutes TTL (weather changes slowly)
- Places/attractions: 24 hours TTL (static data)
- Currency rates: 1 hour TTL (if implemented)

Cache key format: `{apiName}:{param}` (e.g., `weather:Paris`, `places:London`)

## Migration Path to Microservices

Phase 2 will split the monolith into:
1. **Trip Service** - CRUD for trips/itinerary (Supabase)
2. **Weather Service** - OpenWeatherMap wrapper (Redis cache)
3. **Places Service** - Overpass API wrapper (Redis cache)
4. **Budget Service** - Currency + budget calculations (Supabase)
5. **API Gateway** - Routes requests to services

When refactoring for Phase 2:
- Each service needs its own `package.json` and Dockerfile
- Replace in-memory cache with Redis
- Add Supabase Auth for user management
- Implement service-to-service communication (REST or message queue)

## Supabase Setup

Tables must be created manually in Supabase SQL editor. RLS policies are now active on all tables.

**SQL Migration Scripts**: Available in `backend/database/` directory:
- `expenses_table.sql` - Creates expenses table with category validation and indexes
- `add_user_authentication.sql` - Adds user_id columns and RLS policies to all tables

Foreign keys:
- `itinerary.trip_id`, `attractions.trip_id`, `expenses.trip_id` → `trips.id` (CASCADE delete)
- `trips.user_id`, `itinerary.user_id`, `attractions.user_id`, `expenses.user_id` → `auth.users(id)` (CASCADE delete)

## Authentication

**Setup Steps**:
1. Enable Email Auth in Supabase Dashboard (Authentication → Providers)
2. Optional: Enable Google OAuth provider with proper redirect URLs
3. Run `backend/database/add_user_authentication.sql` in Supabase SQL Editor
4. Install Supabase JS client: `cd frontend && npm install @supabase/supabase-js`

**Security**:
- All tables have RLS policies enabled with `auth.uid()` checks
- Each user can only access their own data (SELECT, INSERT, UPDATE, DELETE policies)
- JWT tokens validated automatically by Supabase client
- Frontend uses Supabase client directly for all data operations
- Backend API only used for external service integrations (weather, places)

**Components**:
- `AuthContext.jsx` - Centralized auth state management with useAuth hook
- `LoginPage.jsx` - Modern gradient design with email/password + Google OAuth
- `RegisterPage.jsx` - User registration with password validation
- `ProtectedRoute.jsx` - Route guard component for authenticated routes
- `Layout.jsx` - User profile dropdown with avatar initials and logout

## Important Notes
- **Cache must be initialized** before external API routes
- **CORS**: Enable for frontend origin in Express
- **Error handling**: All external API calls should have try-catch with fallback
- **Date formats**: Store as ISO 8601 in DB, display with date-fns formatting
- **MUI theming**: Setup theme provider in `App.jsx` for consistent styling
- **Date validation**: Always validate dates before operations with `instanceof Date` and `isNaN(date.getTime())`
- **Calendar styling**: Use CSS via `sx` prop instead of custom renderDay functions to avoid MUI DateCalendar issues

## Key Components

### Frontend Components

**Pages:**
- `HomePage.jsx` - Trip list with user's trips (Supabase direct queries)
- `CreateTripPage.jsx` - Centered form card for creating new trips
- `TripDetailsPage.jsx` - Three tabs: Overview, Itinerary, Budget
- `LoginPage.jsx` - Gradient background with glassmorphism card, email/password + Google OAuth
- `RegisterPage.jsx` - User registration with password validation

**Components:**
- `Layout.jsx` - Navbar with logo, user profile dropdown (avatar initials), logout
- `ProtectedRoute.jsx` - Route guard checking auth state before rendering
- `WeatherForecast.jsx` - 5-day weather cards (equal width flexbox)
- `AttractionsList.jsx` - Smart search + category filtering with formatted labels
- `ItineraryCalendar.jsx` - Interactive calendar with highlighted trip dates, click to add/edit activities
- `BudgetCalendar.jsx` - Interactive calendar showing daily expenses, budget summary
- `ExpenseForm.jsx` - Dialog for adding expenses with category dropdown

**Context:**
- `AuthContext.jsx` - Supabase client initialization, auth state management, useAuth hook

### Backend Structure

**Controllers** (route handlers):
- `tripController.js` - Trip CRUD operations
- `weatherController.js` - Fetch weather from OpenWeatherMap
- `placesController.js` - Fetch attractions from Overpass API
- `currencyController.js` - Exchange rates
- `itineraryController.js` - Itinerary CRUD
- `expenseController.js` - Expense CRUD with category validation

**Services** (business logic + external APIs):
- `tripService.js` - Supabase trip operations
- `weatherService.js` - OpenWeatherMap integration with caching
- `placesService.js` - Overpass API integration with caching
- `currencyService.js` - ExchangeRate API integration
- `itineraryService.js` - Supabase itinerary operations
- `expenseService.js` - Supabase expense operations

**Middleware:**
- `cache.js` - In-memory cache (15min weather, 24h places, 1h currency)

## Calendar Implementation

The calendar-based UI uses MUI's DateCalendar component with custom styling:

**Key Features:**
- Highlighted trip dates (primary.light background)
- Selected date (primary.main background)
- Disabled dates outside trip range
- Click to view/edit day details

**Important Patterns:**
```javascript
const isDayInTrip = (date) => {
  try {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return false;
    }
    return isWithinInterval(date, { start: startDate, end: endDate });
  } catch {
    return false;
  }
};

<DateCalendar
  value={selectedDate}
  onChange={(newDate) => {
    if (isDayInTrip(newDate)) {
      setSelectedDate(newDate);
    }
  }}
  shouldDisableDate={(date) => !isDayInTrip(date)}
  showDaysOutsideCurrentMonth={false}
  sx={{
    '& .MuiPickersDay-root:not(.Mui-disabled):not(.Mui-selected)': {
      backgroundColor: 'primary.light',
      color: 'primary.contrastText',
    },
    '& .MuiPickersDay-root.Mui-selected': {
      backgroundColor: 'primary.main',
      fontWeight: 'bold',
    },
  }}
/>
```

**Common Pitfalls:**
- Do NOT use custom renderDay functions (causes "Invalid time value" errors)
- Always validate dates with instanceof and isNaN before operations
- Use shouldDisableDate prop instead of manual day rendering
- Style via sx prop, not custom day components

## Current Development Status (Phase 1.5)

**✅ Phase 1.5 COMPLETE - All Core Features + Authentication + Calendar UI Implemented!**

**What's Done:**
1. ✅ Full backend API with caching (weather, places, currency)
2. ✅ Supabase database schema with all tables (trips, itinerary, attractions, expenses)
3. ✅ Complete frontend with all pages and components
4. ✅ Trip creation and listing
5. ✅ Trip details with 3 tabs (Overview, Itinerary, Budget)
6. ✅ Weather forecast (5-day cards)
7. ✅ Attractions list with filtering
8. ✅ Itinerary builder (day-by-day with activities)
9. ✅ Budget tracker with visualization
10. ✅ Expense tracking (add/delete expenses per day with categories: Food, Transport, Accommodation, Activities, Shopping, Other)
11. ✅ User authentication with Supabase Auth (email/password + Google OAuth)
12. ✅ Login/Register pages with modern gradient backgrounds and glassmorphism design
13. ✅ Protected routes with route guards and loading states
14. ✅ User profile dropdown in navbar with avatar initials and logout
15. ✅ Row Level Security (RLS) for multi-tenant data isolation
16. ✅ Interactive calendar UI for itinerary management (ItineraryCalendar)
17. ✅ Interactive calendar UI for budget/expense tracking (BudgetCalendar)
18. ✅ Smart search in attractions list with formatted category labels
19. ✅ Centered Create Trip form with improved styling
20. ✅ Budget summary display (Total Budget, Total Spent, Remaining)
21. ✅ Day-by-day expense breakdown with color-coded category chips
22. ✅ Direct Supabase integration in frontend (bypassing backend API for data operations)

**Ready to Test:**
- Backend: `cd backend && npm run dev` → http://localhost:3000
- Frontend: `cd frontend && npm run dev` → http://localhost:5173
- **Important**: Add OpenWeatherMap API key to `backend/.env` for weather functionality

**Next Phase (Phase 2 - Planned):**
- Microservices migration
- Map integration (Google Maps / Leaflet)
- Drag-and-drop itinerary reordering
- Dark mode
- Export itinerary as PDF
- Social sharing
- Multi-currency support with real-time conversion
- Push notifications for trip reminders
- Offline mode with sync
