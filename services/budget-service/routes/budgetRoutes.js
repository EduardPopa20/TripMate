const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/expenses', budgetController.createExpense);
router.get('/expenses/trip/:tripId', budgetController.getExpensesByTrip);
router.get('/expenses/trip/:tripId/day/:day', budgetController.getExpensesByDay);
router.get('/expenses/trip/:tripId/total', budgetController.getTotalExpenses);
router.delete('/expenses/:id', budgetController.deleteExpense);

router.get('/budget/trip/:tripId/summary', budgetController.getBudgetSummary);

router.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'budget-service', timestamp: new Date().toISOString() });
});

module.exports = router;
