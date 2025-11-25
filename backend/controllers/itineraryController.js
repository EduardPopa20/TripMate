const supabase = require('../models/supabase');

async function addItineraryDay(req, res) {
  try {
    const { trip_id, day_number, date, activities, budget_day } = req.body;

    if (!trip_id || day_number === undefined || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('itinerary')
      .insert([{ trip_id, day_number, date, activities: activities || [], budget_day }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to create itinerary day' });
    }

    res.status(201).json({ data });
  } catch (error) {
    console.error('Error creating itinerary day:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateItineraryDay(req, res) {
  try {
    const { id } = req.params;
    const { activities, budget_day } = req.body;

    const updateData = {};
    if (activities !== undefined) updateData.activities = activities;
    if (budget_day !== undefined) updateData.budget_day = budget_day;

    const { data, error } = await supabase
      .from('itinerary')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to update itinerary day' });
    }

    res.json({ data });
  } catch (error) {
    console.error('Error updating itinerary day:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteItineraryDay(req, res) {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('itinerary')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to delete itinerary day' });
    }

    res.json({ message: 'Itinerary day deleted successfully' });
  } catch (error) {
    console.error('Error deleting itinerary day:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function addAttraction(req, res) {
  try {
    const { trip_id, name, lat, lon, type } = req.body;

    if (!trip_id || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('attractions')
      .insert([{ trip_id, name, lat, lon, type }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to add attraction' });
    }

    res.status(201).json({ data });
  } catch (error) {
    console.error('Error adding attraction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function toggleAttractionVisited(req, res) {
  try {
    const { id } = req.params;
    const { visited } = req.body;

    const { data, error } = await supabase
      .from('attractions')
      .update({ visited })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to update attraction' });
    }

    res.json({ data });
  } catch (error) {
    console.error('Error updating attraction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  addItineraryDay,
  updateItineraryDay,
  deleteItineraryDay,
  addAttraction,
  toggleAttractionVisited
};
