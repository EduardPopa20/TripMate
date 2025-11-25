import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Box,
  InputAdornment,
} from '@mui/material';
import { useCurrency } from '../context/CurrencyContext';

const EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Accommodation',
  'Activities',
  'Shopping',
  'Other',
];

export default function ExpenseForm({ open, onClose, onSubmit, tripId, dayNumber }) {
  const { currencies, currentCurrency, getCurrencyInfo } = useCurrency();
  const [formData, setFormData] = useState({
    category: 'Food',
    description: '',
    amount: '',
    currency: currentCurrency,
  });

  const handleChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleSubmit = () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    onSubmit({
      trip_id: tripId,
      day_number: dayNumber,
      category: formData.category,
      description: formData.description,
      amount: parseFloat(formData.amount),
      currency: formData.currency,
    });

    setFormData({
      category: 'Food',
      description: '',
      amount: '',
      currency: currentCurrency,
    });
  };

  const handleClose = () => {
    setFormData({
      category: 'Food',
      description: '',
      amount: '',
      currency: currentCurrency,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Expense</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            select
            label="Category"
            value={formData.category}
            onChange={handleChange('category')}
            fullWidth
          >
            {EXPENSE_CATEGORIES.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Description"
            value={formData.description}
            onChange={handleChange('description')}
            placeholder="E.g., Lunch at restaurant"
            fullWidth
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Amount"
              type="number"
              value={formData.amount}
              onChange={handleChange('amount')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {getCurrencyInfo(formData.currency).symbol}
                  </InputAdornment>
                ),
              }}
              inputProps={{ min: 0, step: 0.01 }}
              fullWidth
              required
              sx={{ flex: 2 }}
            />
            <TextField
              select
              label="Currency"
              value={formData.currency}
              onChange={handleChange('currency')}
              sx={{ flex: 1 }}
            >
              {currencies.map((currency) => (
                <MenuItem key={currency.code} value={currency.code}>
                  {currency.code}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Add Expense
        </Button>
      </DialogActions>
    </Dialog>
  );
}
