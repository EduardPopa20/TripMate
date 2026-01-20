const express = require('express');
const router = express.Router();
const {
  createTrip,
  getAllTrips,
  getTripById,
  updateTrip,
  deleteTrip
} = require('../controllers/tripController');
const authMiddleware = require('../middleware/authMiddleware');

// Health check - NO AUTH REQUIRED
router.get('/health', (req, res) => {
  res.json({
    service: 'trip-service',
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Apply auth middleware to all routes below
router.use(authMiddleware);

router.post('/trips', createTrip);
router.get('/trips', getAllTrips);
router.get('/trips/:id', getTripById);
router.put('/trips/:id', updateTrip);
router.delete('/trips/:id', deleteTrip);

module.exports = router;
