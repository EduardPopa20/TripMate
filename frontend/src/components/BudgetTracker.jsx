import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { differenceInDays, format, addDays } from 'date-fns';
import { expensesAPI } from '../api/client';
import ExpenseForm from './ExpenseForm';

export default function BudgetTracker({ trip, itinerary }) {
  const [expenses, setExpenses] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(false);

  const startDate = new Date(trip.start_date);
  const endDate = new Date(trip.end_date);
  const tripDays = differenceInDays(endDate, startDate) + 1;

  const totalBudget = trip.budget_total || 0;

  useEffect(() => {
    loadExpenses();
  }, [trip.id]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const response = await expensesAPI.getByTrip(trip.id);
      setExpenses(response.data.data || []);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalSpent = expenses.reduce((sum, expense) => {
    return sum + parseFloat(expense.amount);
  }, 0);

  const budgetPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const getProgressColor = () => {
    if (budgetPercentage < 50) return 'success';
    if (budgetPercentage < 90) return 'warning';
    return 'error';
  };

  const averagePerDay = totalBudget / tripDays;

  const days = Array.from({ length: tripDays }, (_, i) => ({
    dayNumber: i + 1,
    date: format(addDays(startDate, i), 'yyyy-MM-dd'),
    displayDate: format(addDays(startDate, i), 'EEE, MMM dd'),
  }));

  const getExpensesForDay = (dayNumber) => {
    return expenses.filter(exp => exp.day_number === dayNumber);
  };

  const getDayTotal = (dayNumber) => {
    return getExpensesForDay(dayNumber).reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  };

  const handleAddExpense = (dayNumber) => {
    setSelectedDay(dayNumber);
    setDialogOpen(true);
  };

  const handleExpenseSubmit = async (expenseData) => {
    try {
      await expensesAPI.create(expenseData);
      await loadExpenses();
      setDialogOpen(false);
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense');
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;

    try {
      await expensesAPI.delete(expenseId);
      await loadExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense');
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      Food: 'success',
      Transport: 'info',
      Accommodation: 'warning',
      Activities: 'secondary',
      Shopping: 'error',
      Other: 'default',
    };
    return colors[category] || 'default';
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Budget Tracker
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Total Budget
          </Typography>
          <Typography variant="h4" gutterBottom>
            €{totalBudget.toFixed(2)}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Spent: €{totalSpent.toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {budgetPercentage.toFixed(1)}%
            </Typography>
          </Box>

          <LinearProgress
            variant="determinate"
            value={Math.min(budgetPercentage, 100)}
            color={getProgressColor()}
            sx={{ height: 10, borderRadius: 1 }}
          />

          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Remaining: €{Math.max(totalBudget - totalSpent, 0).toFixed(2)}
          </Typography>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Trip Duration
              </Typography>
              <Typography variant="h5">{tripDays} days</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Average per Day
              </Typography>
              <Typography variant="h5">€{averagePerDay.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Daily Expenses
        </Typography>
        {days.map((day) => {
          const dayExpenses = getExpensesForDay(day.dayNumber);
          const dayTotal = getDayTotal(day.dayNumber);

          return (
            <Accordion key={day.dayNumber} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', pr: 2 }}>
                  <Typography>
                    Day {day.dayNumber} - {day.displayDate}
                  </Typography>
                  <Typography color="primary" fontWeight="bold">
                    €{dayTotal.toFixed(2)}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {dayExpenses.length > 0 ? (
                  <List dense>
                    {dayExpenses.map((expense) => (
                      <ListItem key={expense.id}>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip
                                label={expense.category}
                                size="small"
                                color={getCategoryColor(expense.category)}
                              />
                              <Typography variant="body2">
                                {expense.description || 'No description'}
                              </Typography>
                            </Box>
                          }
                          secondary={`€${parseFloat(expense.amount).toFixed(2)}`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => handleDeleteExpense(expense.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No expenses recorded for this day
                  </Typography>
                )}
                <Divider sx={{ my: 1 }} />
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => handleAddExpense(day.dayNumber)}
                  size="small"
                  variant="outlined"
                  fullWidth
                >
                  Add Expense
                </Button>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>

      <ExpenseForm
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleExpenseSubmit}
        tripId={trip.id}
        dayNumber={selectedDay}
      />
    </Box>
  );
}
