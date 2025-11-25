const { getAttractions } = require('../services/placesService');

async function getPlaces(req, res) {
  try {
    const { city } = req.params;

    if (!city) {
      return res.status(400).json({ error: 'City parameter is required' });
    }

    const placesData = await getAttractions(city);

    if (res.sendCachedResponse) {
      res.sendCachedResponse(placesData);
    } else {
      res.json({ data: placesData });
    }
  } catch (error) {
    console.error('Error fetching places:', error);

    if (error.message === 'City not found') {
      return res.status(404).json({ error: 'City not found' });
    }

    res.status(500).json({ error: 'Failed to fetch attractions' });
  }
}

module.exports = { getPlaces };
