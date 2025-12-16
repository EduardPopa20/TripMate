const tripService = require('../services/tripService');
const logger = require('../../../shared/utils/logger');

async function createTrip(req, res, next) {
  try {
    const { city, country, start_date, end_date, budget_total } = req.body;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: 'Unauthorized - user_id required' });
    }

    if (!city || !country || !start_date || !end_date) {
      return res.status(400).json({
        error: 'Missing required fields: city, country, start_date, end_date'
      });
    }

    const trip = await tripService.createTrip({
      city,
      country,
      start_date,
      end_date,
      budget_total,
      user_id
    });

    res.status(201).json({
      success: true,
      data: trip
    });
  } catch (error) {
    if (error.message === 'End date must be after start date') {
      return res.status(400).json({ error: error.message });
    }
    logger.error('Create trip controller error:', error);
    next(error);
  }
}

async function getAllTrips(req, res, next) {
  try {
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: 'Unauthorized - user_id required' });
    }

    const trips = await tripService.getAllTrips(user_id);

    res.json({
      success: true,
      data: trips,
      count: trips.length
    });
  } catch (error) {
    logger.error('Get all trips controller error:', error);
    next(error);
  }
}

async function getTripById(req, res, next) {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: 'Unauthorized - user_id required' });
    }

    const trip = await tripService.getTripById(id, user_id);

    res.json({
      success: true,
      data: trip
    });
  } catch (error) {
    if (error.message === 'Trip not found') {
      return res.status(404).json({ error: 'Trip not found' });
    }
    logger.error('Get trip by ID controller error:', error);
    next(error);
  }
}

async function updateTrip(req, res, next) {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;
    const updates = req.body;

    if (!user_id) {
      return res.status(401).json({ error: 'Unauthorized - user_id required' });
    }

    const trip = await tripService.updateTrip(id, user_id, updates);

    res.json({
      success: true,
      data: trip
    });
  } catch (error) {
    if (error.message === 'Trip not found or unauthorized') {
      return res.status(404).json({ error: 'Trip not found' });
    }
    if (error.message === 'End date must be after start date') {
      return res.status(400).json({ error: error.message });
    }
    logger.error('Update trip controller error:', error);
    next(error);
  }
}

async function deleteTrip(req, res, next) {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: 'Unauthorized - user_id required' });
    }

    await tripService.deleteTrip(id, user_id);

    res.json({
      success: true,
      message: 'Trip deleted successfully'
    });
  } catch (error) {
    logger.error('Delete trip controller error:', error);
    next(error);
  }
}

module.exports = {
  createTrip,
  getAllTrips,
  getTripById,
  updateTrip,
  deleteTrip
};
