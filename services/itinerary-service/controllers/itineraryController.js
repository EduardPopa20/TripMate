const itineraryService = require('../services/itineraryService');
const logger = require('../../../shared/utils/logger');

async function addItineraryDay(req, res, next) {
  try {
    const { trip_id, day_number, date, activities, budget_day } = req.body;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!trip_id || day_number === undefined || !date) {
      return res.status(400).json({ error: 'Missing required fields: trip_id, day_number, date' });
    }

    const itinerary = await itineraryService.addItineraryDay({
      trip_id, day_number, date, activities, budget_day, user_id
    });

    res.status(201).json({ success: true, data: itinerary });
  } catch (error) {
    logger.error('Add itinerary day error:', error);
    next(error);
  }
}

async function getItineraryByTrip(req, res, next) {
  try {
    const { tripId } = req.params;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const itinerary = await itineraryService.getItineraryByTrip(tripId, user_id);

    res.json({ success: true, data: itinerary, count: itinerary.length });
  } catch (error) {
    logger.error('Get itinerary error:', error);
    next(error);
  }
}

async function updateItineraryDay(req, res, next) {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;
    const updates = req.body;

    if (!user_id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const itinerary = await itineraryService.updateItineraryDay(id, user_id, updates);

    res.json({ success: true, data: itinerary });
  } catch (error) {
    if (error.message === 'Itinerary day not found') {
      return res.status(404).json({ error: 'Itinerary day not found' });
    }
    logger.error('Update itinerary day error:', error);
    next(error);
  }
}

async function deleteItineraryDay(req, res, next) {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await itineraryService.deleteItineraryDay(id, user_id);

    res.json({ success: true, message: 'Itinerary day deleted successfully' });
  } catch (error) {
    logger.error('Delete itinerary day error:', error);
    next(error);
  }
}

async function addAttraction(req, res, next) {
  try {
    const { trip_id, name, lat, lon, type } = req.body;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!trip_id || !name) {
      return res.status(400).json({ error: 'Missing required fields: trip_id, name' });
    }

    const attraction = await itineraryService.addAttraction({
      trip_id, name, lat, lon, type, user_id
    });

    res.status(201).json({ success: true, data: attraction });
  } catch (error) {
    logger.error('Add attraction error:', error);
    next(error);
  }
}

async function getAttractionsByTrip(req, res, next) {
  try {
    const { tripId } = req.params;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const attractions = await itineraryService.getAttractionsByTrip(tripId, user_id);

    res.json({ success: true, data: attractions, count: attractions.length });
  } catch (error) {
    logger.error('Get attractions error:', error);
    next(error);
  }
}

async function toggleAttractionVisited(req, res, next) {
  try {
    const { id } = req.params;
    const { visited } = req.body;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const attraction = await itineraryService.toggleAttractionVisited(id, user_id, visited);

    res.json({ success: true, data: attraction });
  } catch (error) {
    if (error.message === 'Attraction not found') {
      return res.status(404).json({ error: 'Attraction not found' });
    }
    logger.error('Toggle attraction visited error:', error);
    next(error);
  }
}

module.exports = {
  addItineraryDay,
  getItineraryByTrip,
  updateItineraryDay,
  deleteItineraryDay,
  addAttraction,
  getAttractionsByTrip,
  toggleAttractionVisited
};
