const express = require('express');
const router = express.Router();
const { cacheMiddleware } = require('../middleware/cache');

const { createTrip, getAllTrips, getTripById, deleteTrip } = require('../controllers/tripController');
const { getWeather } = require('../controllers/weatherController');
const { getPlaces } = require('../controllers/placesController');
const { getCurrency, convertAmount } = require('../controllers/currencyController');
const {
  addItineraryDay,
  updateItineraryDay,
  deleteItineraryDay,
  addAttraction,
  toggleAttractionVisited
} = require('../controllers/itineraryController');
const {
  createExpense,
  getExpensesByTrip,
  getExpensesByDay,
  deleteExpense,
  getTotalExpenses
} = require('../controllers/expenseController');

router.post('/trips', createTrip);
router.get('/trips', getAllTrips);
router.get('/trips/:id', getTripById);
router.delete('/trips/:id', deleteTrip);

router.get('/weather/:city', cacheMiddleware('weather'), getWeather);
router.get('/places/:city', cacheMiddleware('places'), getPlaces);
router.get('/currency/:from/:to', cacheMiddleware('currency'), getCurrency);
router.get('/currency/convert', convertAmount);

router.post('/itinerary', addItineraryDay);
router.put('/itinerary/:id', updateItineraryDay);
router.delete('/itinerary/:id', deleteItineraryDay);

router.post('/attractions', addAttraction);
router.patch('/attractions/:id/visited', toggleAttractionVisited);

router.post('/expenses', createExpense);
router.get('/expenses/:tripId', getExpensesByTrip);
router.get('/expenses/:tripId/day/:dayNumber', getExpensesByDay);
router.get('/expenses/:tripId/total', getTotalExpenses);
router.delete('/expenses/:id', deleteExpense);

module.exports = router;
