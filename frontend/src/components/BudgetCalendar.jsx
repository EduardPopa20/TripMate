import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  Button,
  IconButton,
} from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { format, addDays, differenceInDays, isWithinInterval, startOfDay } from 'date-fns';
import { supabase, useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import ExpenseForm from './ExpenseForm';
import CurrencyDisplay from './CurrencyDisplay';

export default function BudgetCalendar({ trip }) {
  const { user } = useAuth();
  const { formatAmount } = useCurrency();
  const startDate = useMemo(() => startOfDay(new Date(trip.start_date)), [trip.start_date]);
  const endDate = useMemo(() => startOfDay(new Date(trip.end_date)), [trip.end_date]);

  const [selectedDate, setSelectedDate] = useState(startDate);
  const [expenses, setExpenses] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(startDate);

  const tripDays = differenceInDays(endDate, startDate) + 1;
  const totalBudget = trip.budget_total || 0;

  useEffect(() => {
    loadExpenses();
  }, [trip.id]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('trip_id', trip.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const isDayInTrip = (date) => {
    try {
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return false;
      }
      const normalizedDate = startOfDay(date);
      return isWithinInterval(normalizedDate, { start: startDate, end: endDate });
    } catch (error) {
      console.error('Error in isDayInTrip:', error);
      return false;
    }
  };

  const shouldDisableDate = (date) => {
    return !isDayInTrip(date);
  };

  const selectedDayNumber = differenceInDays(selectedDate, startDate) + 1;

  const getExpensesForDay = (dayNumber) => {
    return expenses.filter(exp => exp.day_number === dayNumber);
  };

  const getDayTotal = (dayNumber) => {
    return getExpensesForDay(dayNumber).reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  };

  const totalSpent = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const budgetPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const selectedDayExpenses = getExpensesForDay(selectedDayNumber);
  const selectedDayTotal = getDayTotal(selectedDayNumber);

  const handleAddExpense = () => {
    setDialogOpen(true);
  };

  const handleExpenseSubmit = async (expenseData) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .insert([{
          ...expenseData,
          user_id: user.id,
        }]);

      if (error) throw error;

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
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);

      if (error) throw error;
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

  const getProgressColor = () => {
    if (budgetPercentage < 50) return 'success';
    if (budgetPercentage < 90) return 'warning';
    return 'error';
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Daily Expenses
      </Typography>

      <Card
        sx={{
          mb: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 3,
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500, mb: 1 }}>
                Total Budget
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                <CurrencyDisplay amount={totalBudget} />
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500, mb: 1 }}>
                Total Spent
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 600,
                  color: budgetPercentage > 90 ? '#ffeb3b' : 'white',
                }}
              >
                <CurrencyDisplay amount={totalSpent} />
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500, mb: 1 }}>
                Remaining
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                <CurrencyDisplay amount={Math.max(totalBudget - totalSpent, 0)} />
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Paper elevation={2} sx={{ p: 2, display: 'inline-block' }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateCalendar
                value={selectedDate}
                onChange={(newDate) => {
                  if (isDayInTrip(newDate)) {
                    setSelectedDate(newDate);
                  }
                }}
                onMonthChange={(newMonth) => setCurrentMonth(newMonth)}
                shouldDisableDate={shouldDisableDate}
                showDaysOutsideCurrentMonth={false}
                minDate={startDate}
                maxDate={endDate}
                sx={{
                  '& .MuiPickersDay-root:not(.Mui-disabled):not(.Mui-selected)': {
                    backgroundColor: 'primary.light',
                    color: 'primary.contrastText',
                    '&:hover': {
                      backgroundColor: 'primary.main',
                    },
                  },
                  '& .MuiPickersDay-root.Mui-selected': {
                    backgroundColor: 'primary.main',
                    fontWeight: 'bold',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  },
                }}
              />
            </LocalizationProvider>
          </Paper>
        </Box>

        <Box>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Day {selectedDayNumber} - {format(selectedDate, 'EEE, MMM dd, yyyy')}
                </Typography>
                <Typography variant="h6" color="primary">
                  <CurrencyDisplay amount={selectedDayTotal} />
                </Typography>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {selectedDayExpenses.length > 0 ? (
                <List dense>
                  {selectedDayExpenses.map((expense) => (
                    <ListItem
                      key={expense.id}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 1,
                      }}
                    >
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
                        secondary={
                          <Typography variant="body2" color="primary" fontWeight="bold">
                            <CurrencyDisplay amount={parseFloat(expense.amount)} fromCurrency={expense.currency} />
                          </Typography>
                        }
                      />
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => handleDeleteExpense(expense.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  No expenses recorded for this day
                </Typography>
              )}

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddExpense}
                fullWidth
                sx={{ mt: 2 }}
              >
                Add Expense
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <ExpenseForm
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleExpenseSubmit}
        tripId={trip.id}
        dayNumber={selectedDayNumber}
      />
    </Box>
  );
}
