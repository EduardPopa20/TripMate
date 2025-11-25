import { useState } from 'react';
import {
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Box,
  Alert,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate } from 'react-router-dom';
import { supabase, useAuth } from '../context/AuthContext';

export default function CreateTripPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    city: '',
    country: '',
    start_date: null,
    end_date: null,
    budget_total: '',
    budget_currency: 'EUR',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const currencies = [
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'RON', symbol: 'lei', name: 'Romanian Leu' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  ];

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.city || !formData.country || !formData.start_date || !formData.end_date) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.start_date > formData.end_date) {
      setError('End date must be after start date');
      return;
    }

    setLoading(true);

    try {
      let budgetInEur = formData.budget_total ? parseFloat(formData.budget_total) : null;

      if (budgetInEur && formData.budget_currency !== 'EUR') {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/currency/${formData.budget_currency}/EUR`
        );
        if (response.ok) {
          const { data: exchangeData } = await response.json();
          budgetInEur = parseFloat((budgetInEur * exchangeData.rate).toFixed(2));
        }
      }

      const tripData = {
        city: formData.city.trim(),
        country: formData.country.trim(),
        start_date: formData.start_date.toISOString().split('T')[0],
        end_date: formData.end_date.toISOString().split('T')[0],
        budget_total: budgetInEur,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from('trips')
        .insert([tripData])
        .select()
        .single();

      if (error) throw error;
      navigate(`/trip/${data.id}`);
    } catch (err) {
      console.error('Error creating trip:', err);
      setError('Failed to create trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          color: 'primary.main',
          fontWeight: 'bold',
          mb: 4,
        }}
      >
        Create New Trip
      </Typography>

      <Card sx={{ maxWidth: 600, width: '100%' }}>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="City"
              required
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="e.g., Paris"
            />

            <TextField
              label="Country"
              required
              value={formData.country}
              onChange={(e) => handleChange('country', e.target.value)}
              placeholder="e.g., France"
            />

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={formData.start_date}
                onChange={(date) => handleChange('start_date', date)}
                slotProps={{
                  textField: { required: true },
                }}
              />

              <DatePicker
                label="End Date"
                value={formData.end_date}
                onChange={(date) => handleChange('end_date', date)}
                minDate={formData.start_date}
                slotProps={{
                  textField: { required: true },
                }}
              />
            </LocalizationProvider>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Total Budget"
                type="number"
                value={formData.budget_total}
                onChange={(e) => handleChange('budget_total', e.target.value)}
                placeholder="e.g., 1000"
                inputProps={{ min: 0, step: 0.01 }}
                sx={{ flex: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {currencies.find(c => c.code === formData.budget_currency)?.symbol}
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                select
                label="Currency"
                value={formData.budget_currency}
                onChange={(e) => handleChange('budget_currency', e.target.value)}
                sx={{ flex: 1 }}
              >
                {currencies.map((currency) => (
                  <MenuItem key={currency.code} value={currency.code}>
                    {currency.code} ({currency.symbol})
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Box display="flex" gap={2}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Trip'}
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/')}
                disabled={loading}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
