const supabase = require('../../../shared/config/supabaseClient');
const logger = require('../../../shared/utils/logger');

async function addItineraryDay({ trip_id, day_number, date, activities, budget_day, user_id }) {
  try {
    logger.info(`Adding itinerary day ${day_number} for trip ${trip_id}`);

    const { data, error } = await supabase
      .from('itinerary')
      .insert([{
        trip_id,
        day_number,
        date,
        activities: activities || [],
        budget_day: budget_day || 0,
        user_id
      }])
      .select()
      .single();

    if (error) throw error;

    logger.info(`Itinerary day created: ${data.id}`);
    return data;
  } catch (error) {
    logger.error('Error adding itinerary day:', error);
    throw error;
  }
}

async function getItineraryByTrip(trip_id, user_id) {
  try {
    logger.info(`Fetching itinerary for trip ${trip_id}`);

    const { data, error } = await supabase
      .from('itinerary')
      .select('*')
      .eq('trip_id', trip_id)
      .eq('user_id', user_id)
      .order('day_number', { ascending: true });

    if (error) throw error;

    logger.info(`Found ${data.length} itinerary days`);
    return data;
  } catch (error) {
    logger.error('Error fetching itinerary:', error);
    throw error;
  }
}

async function updateItineraryDay(id, user_id, updates) {
  try {
    logger.info(`Updating itinerary day ${id}`);

    const { data, error } = await supabase
      .from('itinerary')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user_id)
      .select()
      .single();

    if (error || !data) throw new Error('Itinerary day not found');

    logger.info(`Itinerary day updated: ${id}`);
    return data;
  } catch (error) {
    logger.error('Error updating itinerary day:', error);
    throw error;
  }
}

async function deleteItineraryDay(id, user_id) {
  try {
    logger.info(`Deleting itinerary day ${id}`);

    const { error } = await supabase
      .from('itinerary')
      .delete()
      .eq('id', id)
      .eq('user_id', user_id);

    if (error) throw error;

    logger.info(`Itinerary day deleted: ${id}`);
    return true;
  } catch (error) {
    logger.error('Error deleting itinerary day:', error);
    throw error;
  }
}

async function addAttraction({ trip_id, name, lat, lon, type, user_id }) {
  try {
    logger.info(`Adding attraction ${name} to trip ${trip_id}`);

    const { data, error } = await supabase
      .from('attractions')
      .insert([{ trip_id, name, lat, lon, type, user_id }])
      .select()
      .single();

    if (error) throw error;

    logger.info(`Attraction added: ${data.id}`);
    return data;
  } catch (error) {
    logger.error('Error adding attraction:', error);
    throw error;
  }
}

async function getAttractionsByTrip(trip_id, user_id) {
  try {
    logger.info(`Fetching attractions for trip ${trip_id}`);

    const { data, error } = await supabase
      .from('attractions')
      .select('*')
      .eq('trip_id', trip_id)
      .eq('user_id', user_id);

    if (error) throw error;

    logger.info(`Found ${data.length} attractions`);
    return data;
  } catch (error) {
    logger.error('Error fetching attractions:', error);
    throw error;
  }
}

async function toggleAttractionVisited(id, user_id, visited) {
  try {
    logger.info(`Toggling visited status for attraction ${id}`);

    const { data, error } = await supabase
      .from('attractions')
      .update({ visited })
      .eq('id', id)
      .eq('user_id', user_id)
      .select()
      .single();

    if (error || !data) throw new Error('Attraction not found');

    logger.info(`Attraction updated: ${id}`);
    return data;
  } catch (error) {
    logger.error('Error updating attraction:', error);
    throw error;
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
