const supabase = require('../models/supabase');

async function createExpense({ trip_id, day_number, category, description, amount, currency = 'EUR' }) {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .insert([{ trip_id, day_number, category, description, amount, currency }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating expense:', error.message);
    throw error;
  }
}

async function getExpensesByTrip(trip_id) {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('trip_id', trip_id)
      .order('day_number', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching expenses:', error.message);
    throw error;
  }
}

async function getExpensesByDay(trip_id, day_number) {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('trip_id', trip_id)
      .eq('day_number', day_number)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching day expenses:', error.message);
    throw error;
  }
}

async function deleteExpense(id) {
  try {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting expense:', error.message);
    throw error;
  }
}

async function getTotalExpensesByTrip(trip_id) {
  try {
    const expenses = await getExpensesByTrip(trip_id);
    const total = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    return { total, expenses };
  } catch (error) {
    console.error('Error calculating total expenses:', error.message);
    throw error;
  }
}

module.exports = {
  createExpense,
  getExpensesByTrip,
  getExpensesByDay,
  deleteExpense,
  getTotalExpensesByTrip
};
