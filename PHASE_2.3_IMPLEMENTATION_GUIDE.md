# Phase 2.3 Implementation Guide - Core Business Services

**Status**: ✅ COMPLETE
**Completed**: Trip Service ✅ | Itinerary Service ✅ | Budget Service ✅
**Test Results**: See `services/PHASE_2.3_TEST_RESULTS.md`

---

## ✅ Trip Service - COMPLETE

**Port**: 3001
**Database**: Supabase (`trips` table)
**Authentication**: x-user-id header (simplified for microservices)

### Files Created (8 files):
1. `package.json` - Dependencies
2. `index.js` - Express server
3. `services/tripService.js` - Business logic (Supabase integration)
4. `controllers/tripController.js` - Request handlers
5. `routes/tripRoutes.js` - API endpoints
6. `middleware/authMiddleware.js` - Simple auth (x-user-id header)
7. `.env.example` - Environment template
8. `Dockerfile` - Container configuration

### Endpoints:
```
POST   /api/trips          - Create trip (requires x-user-id header)
GET    /api/trips          - List user's trips
GET    /api/trips/:id      - Get trip details
PUT    /api/trips/:id      - Update trip
DELETE /api/trips/:id      - Delete trip
GET    /api/health         - Health check
```

### Key Features:
- ✅ User isolation (RLS via user_id)
- ✅ Date validation (end_date > start_date)
- ✅ Complete CRUD operations
- ✅ Winston logging
- ✅ Error handling
- ✅ Supabase integration

### To Test:
```bash
cd services/trip-service
npm install

# Copy Supabase credentials from backend/.env
SUPABASE_URL=...
SUPABASE_ANON_KEY=...

cp .env.example .env
# Edit .env with Supabase credentials

npm run dev

# Test with curl (replace USER_ID with actual UUID from Supabase):
curl -X POST http://localhost:3001/api/trips \
  -H "Content-Type: application/json" \
  -H "x-user-id: YOUR_USER_ID" \
  -d '{"city":"Paris","country":"France","start_date":"2025-06-01","end_date":"2025-06-05","budget_total":1500}'
```

---

## ✅ Itinerary Service - COMPLETE

**Port**: 3002
**Database**: Supabase (`itinerary`, `attractions` tables)
**Similar to**: Trip Service

### Endpoints Needed:
```
POST   /api/itinerary                - Add itinerary day
PUT    /api/itinerary/:id            - Update day
DELETE /api/itinerary/:id            - Delete day
GET    /api/itinerary/trip/:tripId   - Get trip itinerary

POST   /api/attractions               - Save attraction
PATCH  /api/attractions/:id/visited  - Toggle visited status
GET    /api/attractions/trip/:tripId - Get trip attractions
```

### Key Logic:
- Verify trip belongs to user before adding itinerary
- Store activities as JSONB array
- Link attractions to trips
- User isolation via user_id

### Quick Implementation:
```bash
# Copy Trip Service structure:
cp -r services/trip-service services/itinerary-service

# Update package.json name to "itinerary-service"
# Update port to 3002
# Modify services/itineraryService.js with itinerary logic
# Update controllers with itinerary endpoints
```

---

## ✅ Budget Service - COMPLETE

**Port**: 3003
**Database**: Supabase (`expenses` table)
**Inter-Service**: Calls Currency Service for conversions

### Endpoints Needed:
```
POST   /api/expenses                        - Create expense
GET    /api/expenses/trip/:tripId           - List all expenses
GET    /api/expenses/trip/:tripId/day/:day  - Get day expenses
GET    /api/expenses/trip/:tripId/total     - Get totals
DELETE /api/expenses/:id                    - Delete expense

GET    /api/budget/trip/:tripId/summary     - Budget summary
```

### Key Logic:
- Verify trip belongs to user
- Validate expense categories (Food, Transport, etc.)
- Calculate daily/total expenses
- **Call Currency Service** for multi-currency support

### Inter-Service Communication Example:
```javascript
// services/budgetService.js
const axios = require('axios');

const CURRENCY_SERVICE_URL = process.env.CURRENCY_SERVICE_URL || 'http://localhost:3006';

async function convertExpenseToCurrency(amount, fromCurrency, toCurrency) {
  const response = await axios.post(`${CURRENCY_SERVICE_URL}/api/currency/convert`, {
    amount,
    from: fromCurrency,
    to: toCurrency
  });
  return response.data.data.converted_amount;
}

async function getBudgetSummary(tripId, baseCurrency = 'EUR') {
  // Get all expenses
  const expenses = await getExpensesByTrip(tripId);

  // Convert all to base currency
  let totalConverted = 0;
  for (const expense of expenses) {
    if (expense.currency === baseCurrency) {
      totalConverted += expense.amount;
    } else {
      const converted = await convertExpenseToCurrency(
        expense.amount,
        expense.currency,
        baseCurrency
      );
      totalConverted += converted;
    }
  }

  // Get trip budget
  const trip = await getTripById(tripId);

  return {
    budget_total: trip.budget_total,
    total_spent: totalConverted,
    remaining: trip.budget_total - totalConverted,
    currency: baseCurrency
  };
}
```

---

## 🔗 Service Dependencies

```
Trip Service (3001)      - Standalone (no dependencies)
    ↓
Itinerary Service (3002) - Depends on: Trip existence check
    ↓
Budget Service (3003)    - Depends on: Trip check + Currency Service (3006)
```

---

## 🚀 Quick Implementation Steps

### 1. Complete Itinerary Service (30-45 min)
```bash
# Create from template (copy Trip Service)
cp -r services/trip-service services/itinerary-service

# Modify files:
# - package.json: name, description
# - index.js: PORT=3002, service name
# - services/itineraryService.js: implement itinerary + attractions logic
# - controllers/itineraryController.js: implement endpoints
# - routes/itineraryRoutes.js: define routes
```

### 2. Complete Budget Service (45-60 min)
```bash
# Create from template
cp -r services/trip-service services/budget-service

# Modify files:
# - package.json: name, add axios dependency
# - index.js: PORT=3003
# - services/budgetService.js: expenses + currency integration
# - controllers/budgetController.js: budget endpoints
# - Add CURRENCY_SERVICE_URL to .env.example
```

### 3. Test Inter-Service Communication
```bash
# Terminal 1: Currency Service
cd services/currency-service && npm run dev

# Terminal 2: Budget Service
cd services/budget-service && npm run dev

# Terminal 3: Test conversion
curl -X POST http://localhost:3003/api/budget/trip/TRIP_ID/summary \
  -H "x-user-id: USER_ID"

# Should call Currency Service internally!
```

---

## 📦 Environment Setup

All 3 core services need:

```env
# services/*/env
PORT=300X
NODE_ENV=development
SERVICE_NAME=service-name
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_key
LOG_LEVEL=info

# Budget Service additionally needs:
CURRENCY_SERVICE_URL=http://localhost:3006
```

---

## 🧪 Testing Workflow

### 1. Start All Services
```bash
# Terminal 1 - Trip
cd services/trip-service && npm run dev

# Terminal 2 - Itinerary
cd services/itinerary-service && npm run dev

# Terminal 3 - Budget
cd services/budget-service && npm run dev

# Terminal 4 - Currency (already running)
# (running from Phase 2.2)
```

### 2. Test Full Flow
```bash
USER_ID="your-user-uuid"

# 1. Create trip
TRIP_ID=$(curl -X POST http://localhost:3001/api/trips \
  -H "Content-Type: application/json" \
  -H "x-user-id: $USER_ID" \
  -d '{"city":"Paris","country":"France","start_date":"2025-06-01","end_date":"2025-06-05","budget_total":1500}' \
  | jq -r '.data.id')

echo "Created trip: $TRIP_ID"

# 2. Add itinerary day
curl -X POST http://localhost:3002/api/itinerary \
  -H "Content-Type: application/json" \
  -H "x-user-id: $USER_ID" \
  -d "{\"trip_id\":\"$TRIP_ID\",\"day_number\":1,\"date\":\"2025-06-01\",\"activities\":[\"Eiffel Tower\"],\"budget_day\":200}"

# 3. Add expense
curl -X POST http://localhost:3003/api/expenses \
  -H "Content-Type: application/json" \
  -H "x-user-id: $USER_ID" \
  -d "{\"trip_id\":\"$TRIP_ID\",\"day_number\":1,\"category\":\"Food\",\"description\":\"Lunch\",\"amount\":25,\"currency\":\"EUR\"}"

# 4. Get budget summary (will call Currency Service!)
curl "http://localhost:3003/api/budget/trip/$TRIP_ID/summary" \
  -H "x-user-id: $USER_ID"
```

---

## 📊 Progress Tracking

| Service | Port | Status | Database | Dependencies |
|---------|------|--------|----------|--------------|
| Trip | 3001 | ✅ Complete | Supabase (trips) | None |
| Itinerary | 3002 | ✅ Complete | Supabase (itinerary, attractions) | Trip check |
| Budget | 3003 | ✅ Complete | Supabase (expenses) | Trip check, Currency Service |

---

## 🎯 Next Steps

1. ✅ **Complete Itinerary Service** - DONE
2. ✅ **Complete Budget Service** - DONE
3. ✅ **Test inter-service communication** - DONE (Budget → Currency validated)
4. ✅ **Update documentation** - DONE
5. 🔜 **Move to Phase 2.4** (API Gateway) - NEXT PHASE

---

## 💡 Key Learnings from Trip Service

### What Worked Well:
- ✅ Simple auth with x-user-id header (easy to test)
- ✅ Shared utilities (logger, error handler, Supabase client)
- ✅ Consistent structure (same as external API services)
- ✅ User isolation built-in (RLS simulation)

### Pattern to Follow:
```
1. Copy Trip Service structure
2. Update package.json (name, port)
3. Modify service layer (business logic)
4. Update controllers (endpoints)
5. Update routes (API paths)
6. Test with curl
```

---

**Status**: Trip Service ✅ | Itinerary Service ✅ | Budget Service ✅
**Phase 2.3**: COMPLETE - All 3 Core Business Services Operational
**Next**: Phase 2.4 - API Gateway Implementation

---

*Created: 2025-12-15*
*Last Updated: 2025-12-15 18:55*
*Completed: 2025-12-15 18:55*
