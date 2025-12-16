const budgetService = require('../services/budgetService');
const logger = require('../../../shared/utils/logger');

async function createExpense(req, res, next) {
  try {
    const { trip_id, day_number, category, description, amount, currency } = req.body;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!trip_id || day_number === undefined || !category || !amount) {
      return res.status(400).json({ error: 'Missing required fields: trip_id, day_number, category, amount' });
    }

    const expense = await budgetService.createExpense({
      trip_id, user_id, day_number, category, description, amount, currency
    });

    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    logger.error('Create expense error:', error);
    next(error);
  }
}

async function getExpensesByTrip(req, res, next) {
  try {
    const { tripId } = req.params;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const expenses = await budgetService.getExpensesByTrip(tripId, user_id);

    res.json({ success: true, data: expenses, count: expenses.length });
  } catch (error) {
    logger.error('Get expenses error:', error);
    next(error);
  }
}

async function getExpensesByDay(req, res, next) {
  try {
    const { tripId, day } = req.params;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const expenses = await budgetService.getExpensesByDay(tripId, user_id, parseInt(day));

    res.json({ success: true, data: expenses, count: expenses.length });
  } catch (error) {
    logger.error('Get day expenses error:', error);
    next(error);
  }
}

async function deleteExpense(req, res, next) {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await budgetService.deleteExpense(id, user_id);

    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    logger.error('Delete expense error:', error);
    next(error);
  }
}

async function getBudgetSummary(req, res, next) {
  try {
    const { tripId } = req.params;
    const user_id = req.user?.id;
    const { currency } = req.query;

    if (!user_id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const summary = await budgetService.getBudgetSummary(tripId, user_id, currency || 'EUR');

    res.json({ success: true, data: summary });
  } catch (error) {
    logger.error('Get budget summary error:', error);
    next(error);
  }
}

async function getTotalExpenses(req, res, next) {
  try {
    const { tripId } = req.params;
    const user_id = req.user?.id;
    const { currency } = req.query;

    if (!user_id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const total = await budgetService.getTotalExpenses(tripId, user_id, currency || 'EUR');

    res.json({ success: true, data: total });
  } catch (error) {
    logger.error('Get total expenses error:', error);
    next(error);
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
