const axios = require('axios');

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

async function getCityCoordinates(city) {
  try {
    const response = await axios.get(`${NOMINATIM_URL}/search`, {
      params: {
        q: city,
        format: 'json',
        limit: 1
      },
      headers: {
        'User-Agent': 'TripMate/1.0'
      }
    });

    if (response.data.length === 0) {
      throw new Error('City not found');
    }

    return {
      lat: parseFloat(response.data[0].lat),
      lon: parseFloat(response.data[0].lon),
      display_name: response.data[0].display_name
    };
  } catch (error) {
    throw new Error('Failed to geocode city');
  }
}

async function getAttractions(city) {
  try {
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

    const response = await axios.post(OVERPASS_URL, query, {
      headers: {
        'Content-Type': 'text/plain'
      }
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

    return {
      city: coords.display_name,
      attractions
    };
  } catch (error) {
    if (error.message === 'City not found') {
      throw error;
    }
    throw new Error('Failed to fetch attractions');
  }
}

module.exports = { getAttractions, getCityCoordinates };
