import { createContext, useContext, useState, useEffect } from 'react';
import { currencyAPI } from '../api/client';

const CurrencyContext = createContext();

export const CURRENCIES = [
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'RON', symbol: 'lei', name: 'Romanian Leu' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
];

export function CurrencyProvider({ children }) {
  const [currentCurrency, setCurrentCurrency] = useState(() => {
    return localStorage.getItem('selectedCurrency') || 'EUR';
  });
  const [exchangeRates, setExchangeRates] = useState({});

  useEffect(() => {
    localStorage.setItem('selectedCurrency', currentCurrency);
  }, [currentCurrency]);

  const getCurrencyInfo = (code = currentCurrency) => {
    return CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];
  };

  const getExchangeRate = async (from, to) => {
    if (from === to) return 1;

    const cacheKey = `${from}_${to}`;
    if (exchangeRates[cacheKey]) {
      return exchangeRates[cacheKey];
    }

    try {
      const response = await currencyAPI.getRate(from, to);
      const rate = response.data.data.rate;
      setExchangeRates((prev) => ({ ...prev, [cacheKey]: rate }));
      return rate;
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      return 1;
    }
  };

  const convertAmount = async (amount, from, to = currentCurrency) => {
    if (!amount || amount === 0) return 0;
    if (from === to) return amount;

    const rate = await getExchangeRate(from, to);
    return amount * rate;
  };

  const formatAmount = (amount, currency = currentCurrency) => {
    const currencyInfo = getCurrencyInfo(currency);
    return `${currencyInfo.symbol}${parseFloat(amount).toFixed(2)}`;
  };

  const changeCurrency = (newCurrency) => {
    setCurrentCurrency(newCurrency);
    setExchangeRates({});
  };

  return (
    <CurrencyContext.Provider
      value={{
        currentCurrency,
        changeCurrency,
        getCurrencyInfo,
        getExchangeRate,
        convertAmount,
        formatAmount,
        currencies: CURRENCIES,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
