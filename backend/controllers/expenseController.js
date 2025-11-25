const expenseService = require('../services/expenseService');

async function createExpense(req, res) {
  try {
    const { trip_id, day_number, category, description, amount, currency } = req.body;

    if (!trip_id || day_number === undefined || !category || amount === undefined) {
      return res.status(400).json({ error: 'Missing required fields: trip_id, day_number, category, amount' });
    }

    if (amount < 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }

    const validCategories = ['Food', 'Transport', 'Accommodation', 'Activities', 'Shopping', 'Other'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: `Category must be one of: ${validCategories.join(', ')}` });
    }

    const expense = await expenseService.createExpense({
      trip_id,
      day_number,
      category,
      description,
      amount,
      currency
    });

    res.status(201).json({ data: expense });
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ error: 'Failed to create expense' });
  }
}

async function getExpensesByTrip(req, res) {
  try {
    const { tripId } = req.params;

    const expenses = await expenseService.getExpensesByTrip(tripId);
    res.json({ data: expenses });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
}

async function getExpensesByDay(req, res) {
  try {
    const { tripId, dayNumber } = req.params;

    const expenses = await expenseService.getExpensesByDay(tripId, parseInt(dayNumber));
    res.json({ data: expenses });
  } catch (error) {
    console.error('Error fetching day expenses:', error);
    res.status(500).json({ error: 'Failed to fetch day expenses' });
  }
}

async function deleteExpense(req, res) {
  try {
    const { id } = req.params;

    await expenseService.deleteExpense(id);
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
}

async function getTotalExpenses(req, res) {
  try {
    const { tripId } = req.params;

    const result = await expenseService.getTotalExpensesByTrip(tripId);
    res.json({ data: result });
  } catch (error) {
    console.error('Error calculating total expenses:', error);
    res.status(500).json({ error: 'Failed to calculate total expenses' });
  }
}

module.exports = {
  createExpense,
  getExpensesByTrip,
  getExpensesByDay,
  deleteExpense,
  getTotalExpenses
};
