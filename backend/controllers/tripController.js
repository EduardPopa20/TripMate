const supabase = require('../models/supabase');

async function createTrip(req, res) {
  try {
    const { city, country, start_date, end_date, budget_total } = req.body;

    if (!city || !country || !start_date || !end_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('trips')
      .insert([{ city, country, start_date, end_date, budget_total }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to create trip' });
    }

    res.status(201).json({ data });
  } catch (error) {
    console.error('Error creating trip:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getAllTrips(req, res) {
  try {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to fetch trips' });
    }

    res.json({ data });
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getTripById(req, res) {
  try {
    const { id } = req.params;

    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('*')
      .eq('id', id)
      .single();

    if (tripError || !trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const { data: itinerary, error: itineraryError } = await supabase
      .from('itinerary')
      .select('*')
      .eq('trip_id', id)
      .order('day_number', { ascending: true });

    const { data: attractions, error: attractionsError } = await supabase
      .from('attractions')
      .select('*')
      .eq('trip_id', id);

    res.json({
      data: {
        ...trip,
        itinerary: itinerary || [],
        attractions: attractions || []
      }
    });
  } catch (error) {
    console.error('Error fetching trip:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteTrip(req, res) {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('trips')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to delete trip' });
    }

    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Error deleting trip:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { createTrip, getAllTrips, getTripById, deleteTrip };
