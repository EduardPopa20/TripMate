import { useCurrency } from '../context/CurrencyContext';
import { useCurrencyConverter } from '../hooks/useCurrencyConverter';
import { CircularProgress, Box } from '@mui/material';

export default function CurrencyDisplay({ amount, fromCurrency = 'EUR', ...props }) {
  const { formatAmount, currentCurrency } = useCurrency();
  const { convertedAmount, loading } = useCurrencyConverter(amount, fromCurrency);

  if (loading) {
    return (
      <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
        <CircularProgress size={12} sx={{ mr: 0.5 }} />
      </Box>
    );
  }

  return <span {...props}>{formatAmount(convertedAmount, currentCurrency)}</span>;
}
