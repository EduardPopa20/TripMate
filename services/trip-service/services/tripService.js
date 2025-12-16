const supabase = require('../../../shared/config/supabaseClient');
const logger = require('../../../shared/utils/logger');

async function createTrip({ city, country, start_date, end_date, budget_total, user_id }) {
  try {
    logger.info(`Creating trip for user ${user_id}: ${city}, ${country}`);

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (endDate <= startDate) {
      throw new Error('End date must be after start date');
    }

    const { data, error } = await supabase
      .from('trips')
      .insert([{
        city,
        country,
        start_date,
        end_date,
        budget_total: budget_total || 0,
        user_id
      }])
      .select()
      .single();

    if (error) {
      logger.error('Supabase error creating trip:', error);
      throw error;
    }

    logger.info(`Trip created successfully: ${data.id}`);
    return data;
  } catch (error) {
    logger.error('Error creating trip:', { error: error.message });
    throw error;
  }
}

async function getAllTrips(user_id) {
  try {
    logger.info(`Fetching all trips for user: ${user_id}`);

    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Supabase error fetching trips:', error);
      throw error;
    }

    logger.info(`Found ${data.length} trips for user ${user_id}`);
    return data;
  } catch (error) {
    logger.error('Error fetching trips:', { error: error.message });
    throw error;
  }
}

async function getTripById(trip_id, user_id) {
  try {
    logger.info(`Fetching trip ${trip_id} for user ${user_id}`);

    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('*')
      .eq('id', trip_id)
      .eq('user_id', user_id)
      .single();

    if (tripError || !trip) {
      logger.warn(`Trip not found: ${trip_id}`);
      throw new Error('Trip not found');
    }

    logger.info(`Trip found: ${trip.id} - ${trip.city}`);
    return trip;
  } catch (error) {
    logger.error('Error fetching trip:', { error: error.message });
    throw error;
  }
}

async function updateTrip(trip_id, user_id, updates) {
  try {
    logger.info(`Updating trip ${trip_id} for user ${user_id}`);

    if (updates.start_date && updates.end_date) {
      const startDate = new Date(updates.start_date);
      const endDate = new Date(updates.end_date);

      if (endDate <= startDate) {
        throw new Error('End date must be after start date');
      }
    }

    const { data, error } = await supabase
      .from('trips')
      .update(updates)
      .eq('id', trip_id)
      .eq('user_id', user_id)
      .select()
      .single();

    if (error) {
      logger.error('Supabase error updating trip:', error);
      throw error;
    }

    if (!data) {
      throw new Error('Trip not found or unauthorized');
    }

    logger.info(`Trip updated successfully: ${trip_id}`);
    return data;
  } catch (error) {
    logger.error('Error updating trip:', { error: error.message });
    throw error;
  }
}

async function deleteTrip(trip_id, user_id) {
  try {
    logger.info(`Deleting trip ${trip_id} for user ${user_id}`);

    const { error } = await supabase
      .from('trips')
      .delete()
      .eq('id', trip_id)
      .eq('user_id', user_id);

    if (error) {
      logger.error('Supabase error deleting trip:', error);
      throw error;
    }

    logger.info(`Trip deleted successfully: ${trip_id}`);
    return true;
  } catch (error) {
    logger.error('Error deleting trip:', { error: error.message });
    throw error;
  }
}

module.exports = {
  createTrip,
  getAllTrips,
  getTripById,
  updateTrip,
  deleteTrip
};
