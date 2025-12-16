const axios = require('axios');
const logger = require('../../../shared/utils/logger');

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

async function getCityCoordinates(city) {
  try {
    logger.info(`Geocoding city: ${city}`);

    const response = await axios.get(`${NOMINATIM_URL}/search`, {
      params: {
        q: city,
        format: 'json',
        limit: 1
      },
      headers: {
        'User-Agent': 'TripMate/1.0 (microservices)'
      }
    });

    if (response.data.length === 0) {
      logger.warn(`City not found in geocoding: ${city}`);
      throw new Error('City not found');
    }

    const result = {
      lat: parseFloat(response.data[0].lat),
      lon: parseFloat(response.data[0].lon),
      display_name: response.data[0].display_name
    };

    logger.info(`Geocoding successful for ${city}: ${result.lat}, ${result.lon}`);
    return result;
  } catch (error) {
    logger.error(`Geocoding error for ${city}:`, { error: error.message });
    if (error.message === 'City not found') {
      throw error;
    }
    throw new Error('Failed to geocode city');
  }
}

async function getAttractions(city) {
  try {
    logger.info(`Fetching attractions for: ${city}`);

    const coords = await getCityCoordinates(city);
    const radius = 5000;

    const query = `
      [out:json][timeout:25];
      (
        node["tourism"](around:${radius},${coords.lat},${coords.lon});
        node["amenity"="restaurant"](around:${radius},${coords.lat},${coords.lon});
        node["amenity"="cafe"](around:${radius},${coords.lat},${coords.lon});
        node["historic"](around:${radius},${coords.lat},${coords.lon});
      );
      out body;
      >;
      out skel qt;
    `;

    logger.debug(`Overpass query for ${city}`, { radius, lat: coords.lat, lon: coords.lon });

    const response = await axios.post(OVERPASS_URL, query, {
      headers: {
        'Content-Type': 'text/plain'
      },
      timeout: 30000
    });

    const attractions = response.data.elements
      .filter(el => el.tags && el.tags.name)
      .map(el => ({
        name: el.tags.name,
        type: el.tags.tourism || el.tags.amenity || el.tags.historic || 'other',
        lat: el.lat,
        lon: el.lon,
        address: el.tags['addr:street'] || null,
        website: el.tags.website || null,
        phone: el.tags.phone || null
      }))
      .slice(0, 50);

    logger.info(`Found ${attractions.length} attractions for ${city}`);

    return {
      city: coords.display_name,
      coordinates: {
        lat: coords.lat,
        lon: coords.lon
      },
      attractions,
      count: attractions.length
    };
  } catch (error) {
    if (error.message === 'City not found') {
      logger.warn(`City not found: ${city}`);
      throw error;
    }
    logger.error(`Failed to fetch attractions for ${city}:`, { error: error.message });
    throw new Error('Failed to fetch attractions');
  }
}

module.exports = { getAttractions, getCityCoordinates };
