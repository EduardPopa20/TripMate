const axios = require('axios');

const EXCHANGE_RATE_URL = 'https://open.er-api.com/v6/latest';

async function getExchangeRate(from, to) {
  try {
    const response = await axios.get(`${EXCHANGE_RATE_URL}/${from.toUpperCase()}`);

    if (response.data.result !== 'success') {
      throw new Error('Failed to fetch exchange rate');
    }

    const rate = response.data.rates[to.toUpperCase()];

    if (!rate) {
      throw new Error('Currency not found');
    }

    return {
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      rate,
      date: new Date(response.data.time_last_update_unix * 1000).toISOString().split('T')[0]
    };
  } catch (error) {
    console.error('Currency API error:', error.message);
    throw new Error('Failed to fetch currency exchange rate');
  }
}

async function convertCurrency(amount, from, to) {
  try {
    const exchangeData = await getExchangeRate(from, to);
    const convertedAmount = amount * exchangeData.rate;

    return {
      original_amount: amount,
      original_currency: from.toUpperCase(),
      converted_amount: parseFloat(convertedAmount.toFixed(2)),
      converted_currency: to.toUpperCase(),
      rate: exchangeData.rate,
      date: exchangeData.date
    };
  } catch (error) {
    throw new Error('Failed to convert currency');
  }
}

module.exports = { getExchangeRate, convertCurrency };
