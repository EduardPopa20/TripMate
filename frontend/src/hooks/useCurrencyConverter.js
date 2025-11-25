import { useState, useEffect } from 'react';
import { useCurrency } from '../context/CurrencyContext';

export function useCurrencyConverter(amount, fromCurrency = 'EUR') {
  const { currentCurrency, convertAmount } = useCurrency();
  const [convertedAmount, setConvertedAmount] = useState(amount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const convert = async () => {
      if (!amount || amount === 0) {
        setConvertedAmount(0);
        return;
      }

      if (fromCurrency === currentCurrency) {
        setConvertedAmount(amount);
        return;
      }

      setLoading(true);
      try {
        const result = await convertAmount(amount, fromCurrency, currentCurrency);
        setConvertedAmount(result);
      } catch (error) {
        console.error('Error converting currency:', error);
        setConvertedAmount(amount);
      } finally {
        setLoading(false);
      }
    };

    convert();
  }, [amount, fromCurrency, currentCurrency, convertAmount]);

  return { convertedAmount, loading };
}
