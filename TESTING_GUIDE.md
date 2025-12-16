# TripMate - Testing Guide

## ✅ Pre-Testing Checklist

1. **Backend running**: Terminal 1 → `cd backend && npm run dev`
2. **Frontend running**: Terminal 2 → `cd frontend && npm run dev`
3. **Supabase tables created**: Check your Supabase dashboard
4. **OpenWeatherMap API key**: Added to `backend/.env`

## 🧪 Test Scenarios

### Scenario 1: Create Your First Trip

1. Open http://localhost:5173
2. Click **"New Trip"** button
3. Fill in the form:
   - City: "Paris"
   - Country: "France"
   - Start Date: Tomorrow
   - End Date: 5 days from tomorrow
   - Budget: 1000
4. Click **"Create Trip"**
5. ✅ You should be redirected to trip details page

**Expected Result**: Trip appears in homepage list

### Scenario 2: View Weather Forecast

1. Navigate to your Paris trip
2. Go to **"Overview"** tab
3. Check the weather section

**Expected Results**:
- ✅ 5 weather cards displayed
- ✅ Temperature in Celsius
- ✅ Weather icons (sunny/cloudy/rainy)
- ✅ Min/max temperatures
- ⚠️ If error: Check OpenWeatherMap API key in `backend/.env`

### Scenario 3: Browse Attractions

1. In the **"Overview"** tab, scroll to Attractions
2. See list of places in Paris

**Expected Results**:
- ✅ List of museums, restaurants, cafes
- ✅ Type chips at top (museum, restaurant, etc.)
- ✅ Click type chip to filter
- ✅ "+" button to add attraction to trip

### Scenario 4: Build Itinerary

1. Go to **"Itinerary"** tab
2. You'll see stepper for each day
3. For Day 1:
   - Type "Visit Eiffel Tower" in activity field
   - Click **"Add"**
4. For Day 2:
   - Add "Louvre Museum"
5. For Day 3:
   - Add "Montmartre walking tour"

**Expected Results**:
- ✅ Activities appear in each day's card
- ✅ Can delete activities with trash icon
- ✅ Data persists after page refresh

### Scenario 5: Track Budget

1. Go to **"Budget"** tab
2. View budget overview

**Expected Results**:
- ✅ Total budget displayed (€1000)
- ✅ Progress bar (currently 0% since no daily budgets set)
- ✅ Trip duration shown (5 days)
- ✅ Average per day calculated (€200/day)

### Scenario 6: Create Multiple Trips

1. Go back to homepage (click "Back to Trips")
2. Create another trip:
   - City: "Rome"
   - Country: "Italy"
   - Dates: Next month
   - Budget: 1500

**Expected Results**:
- ✅ Both trips visible on homepage
- ✅ Each trip shows dates and budget
- ✅ Cards are clickable

## 🐛 Common Issues & Fixes

### Issue 1: Weather Not Loading
**Symptom**: "Failed to load weather forecast"

**Fix**:
1. Check `backend/.env` has `OPENWEATHER_API_KEY`
2. Verify key is valid at https://openweathermap.org/api
3. Check backend console for errors: `cd backend && npm run dev`

### Issue 2: No Attractions Showing
**Symptom**: Empty attractions list

**Fix**:
1. Overpass API might be slow - wait 10-15 seconds
2. Try a major city (Paris, London, Rome)
3. Check backend console for errors

### Issue 3: Cannot Create Trip
**Symptom**: Error when clicking "Create Trip"

**Fix**:
1. Check all required fields filled
2. Verify Supabase credentials in `backend/.env`
3. Check Supabase tables exist:
   - `trips`
   - `itinerary`
   - `attractions`

### Issue 4: CORS Error in Browser Console
**Symptom**: "CORS policy blocked"

**Fix**:
1. Backend must be running on port 3000
2. Frontend must be running on port 5173
3. Check `backend/index.js` has `app.use(cors())`

### Issue 5: "Cannot read property 'map' of undefined"
**Symptom**: React error on trip details page

**Fix**:
1. Trip data might not be loaded yet
2. Check loading states in components
3. Refresh the page

## 📊 API Testing (Optional)

### Test Backend Directly

```bash
# Health check
curl http://localhost:3000/health

# Get all trips
curl http://localhost:3000/api/trips

# Get weather for Paris
curl http://localhost:3000/api/weather/Paris

# Get attractions for Paris
curl http://localhost:3000/api/places/Paris

# Get currency rate EUR to USD
curl http://localhost:3000/api/currency/EUR/USD
```

## ✅ Acceptance Criteria (Milestone 1)

- [ ] Can create a trip with all details
- [ ] Trip appears on homepage
- [ ] Can view trip details
- [ ] Weather forecast loads (with valid API key)
- [ ] Attractions list loads
- [ ] Can filter attractions by type
- [ ] Can add activities to itinerary
- [ ] Can delete activities from itinerary
- [ ] Budget tracker displays correctly
- [ ] All tabs work without errors
- [ ] Data persists after refresh
- [ ] No console errors (except API key warnings)

## 🚀 Demo Flow for Presentation

1. **Show Homepage**: Empty state → Click "New Trip"
2. **Create Trip**: Fill Paris trip → Submit
3. **Overview Tab**:
   - Point out weather cards
   - Show attractions list
   - Filter by type
4. **Itinerary Tab**:
   - Add 2-3 activities to Day 1
   - Show delete functionality
5. **Budget Tab**:
   - Explain budget tracking
   - Show average per day
6. **Homepage**: Show trip in list

**Talking Points**:
- Monolithic architecture (ready for microservices)
- 3 external APIs integrated (weather, places, currency)
- Caching strategy (15min weather, 24h places)
- Material-UI design system
- Full CRUD operations

## 📝 Known Limitations (Phase 1)

- No user authentication (public access)
- No map visualization (Phase 2)
- No drag-and-drop itinerary reordering
- No image upload for trips
- Currency conversion not fully integrated in UI
- Mobile optimization could be improved

---

**Good luck testing! 🎉**
