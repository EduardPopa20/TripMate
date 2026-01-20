const express = require('express');
const router = express.Router();
const itineraryController = require('../controllers/itineraryController');
const authMiddleware = require('../middleware/authMiddleware');

// Health check - NO AUTH REQUIRED
router.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'itinerary-service', timestamp: new Date().toISOString() });
});

// Apply auth middleware to all routes below
router.use(authMiddleware);

router.post('/itinerary', itineraryController.addItineraryDay);
router.get('/itinerary/trip/:tripId', itineraryController.getItineraryByTrip);
router.put('/itinerary/:id', itineraryController.updateItineraryDay);
router.delete('/itinerary/:id', itineraryController.deleteItineraryDay);

router.post('/attractions', itineraryController.addAttraction);
router.get('/attractions/trip/:tripId', itineraryController.getAttractionsByTrip);
router.patch('/attractions/:id/visited', itineraryController.toggleAttractionVisited);

module.exports = router;
