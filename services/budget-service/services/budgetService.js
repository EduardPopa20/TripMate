const supabase = require('../../../shared/config/supabaseClient');
const logger = require('../../../shared/utils/logger');
const axios = require('axios');

const CURRENCY_SERVICE_URL = process.env.CURRENCY_SERVICE_URL || 'http://localhost:3006';

async function createExpense({ trip_id, user_id, day_number, category, description, amount, currency }) {
  try {
    logger.info(`Creating expense for trip ${trip_id}, day ${day_number}`);

    const validCategories = ['Food', 'Transport', 'Accommodation', 'Activities', 'Shopping', 'Other'];
    if (!validCategories.includes(category)) {
      throw new Error(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
    }

    const { data, error } = await supabase
      .from('expenses')
      .insert([{
        trip_id,
        user_id,
        day_number,
        category,
        description,
        amount,
        currency: currency || 'EUR'
      }])
      .select()
      .single();

    if (error) throw error;

    logger.info(`Expense created: ${data.id}`);
    return data;
  } catch (error) {
    logger.error('Error creating expense:', error);
    throw error;
  }
}

async function getExpensesByTrip(trip_id, user_id) {
  try {
    logger.info(`Fetching expenses for trip ${trip_id}`);

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('trip_id', trip_id)
      .eq('user_id', user_id)
      .order('day_number', { ascending: true });

    if (error) throw error;

    logger.info(`Found ${data.length} expenses`);
    return data;
  } catch (error) {
    logger.error('Error fetching expenses:', error);
    throw error;
  }
}

async function getExpensesByDay(trip_id, user_id, day_number) {
  try {
    logger.info(`Fetching expenses for trip ${trip_id}, day ${day_number}`);

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('trip_id', trip_id)
      .eq('user_id', user_id)
      .eq('day_number', day_number)
      .order('created_at', { ascending: true });

    if (error) throw error;

    logger.info(`Found ${data.length} expenses for day ${day_number}`);
    return data;
  } catch (error) {
    logger.error('Error fetching day expenses:', error);
    throw error;
  }
}

async function deleteExpense(id, user_id) {
  try {
    logger.info(`Deleting expense ${id}`);

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', user_id);

    if (error) throw error;

    logger.info(`Expense deleted: ${id}`);
    return true;
  } catch (error) {
    logger.error('Error deleting expense:', error);
    throw error;
  }
}

async function convertToCurrency(amount, fromCurrency, toCurrency) {
  try {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    logger.info(`Converting ${amount} ${fromCurrency} to ${toCurrency} via Currency Service`);

    const response = await axios.post(`${CURRENCY_SERVICE_URL}/api/currency/convert`, {
      amount,
      from: fromCurrency,
      to: toCurrency
    }, {
      timeout: 5000
    });

    return response.data.data.converted_amount;
  } catch (error) {
    logger.error('Error calling Currency Service:', error.message);
    logger.warn(`Using fallback rate 1:1 for ${fromCurrency} to ${toCurrency}`);
    return amount;
  }
}

async function getBudgetSummary(trip_id, user_id, baseCurrency = 'EUR') {
  try {
    logger.info(`Generating budget summary for trip ${trip_id}`);

    const { data: tripData, error: tripError } = await supabase
      .from('trips')
      .select('budget_total')
      .eq('id', trip_id)
      .eq('user_id', user_id)
      .single();

    if (tripError) throw tripError;
    if (!tripData) throw new Error('Trip not found');

    const expenses = await getExpensesByTrip(trip_id, user_id);

    let totalConverted = 0;
    for (const expense of expenses) {
      const converted = await convertToCurrency(expense.amount, expense.currency, baseCurrency);
      totalConverted += converted;
    }

    const remaining = tripData.budget_total - totalConverted;

    return {
      budget_total: tripData.budget_total,
      total_spent: Math.round(totalConverted * 100) / 100,
      remaining: Math.round(remaining * 100) / 100,
      currency: baseCurrency,
      expense_count: expenses.length
    };
  } catch (error) {
    logger.error('Error generating budget summary:', error);
    throw error;
  }
}

async function getTotalExpenses(trip_id, user_id, baseCurrency = 'EUR') {
  try {
    logger.info(`Calculating total expenses for trip ${trip_id}`);

    const expenses = await getExpensesByTrip(trip_id, user_id);

    let totalConverted = 0;
    for (const expense of expenses) {
      const converted = await convertToCurrency(expense.amount, expense.currency, baseCurrency);
      totalConverted += converted;
    }

    return {
      total: Math.round(totalConverted * 100) / 100,
      currency: baseCurrency,
      expense_count: expenses.length
    };
  } catch (error) {
    logger.error('Error calculating total expenses:', error);
    throw error;
  }
}

module.exports = {
  createExpense,
  getExpensesByTrip,
  getExpensesByDay,
  deleteExpense,
  getBudgetSummary,
  getTotalExpenses
};
