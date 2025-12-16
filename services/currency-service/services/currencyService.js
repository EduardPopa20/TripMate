const axios = require('axios');
const logger = require('../../../shared/utils/logger');

const EXCHANGE_RATE_URL = 'https://open.er-api.com/v6/latest';

async function getExchangeRate(from, to) {
  try {
    const fromUpper = from.toUpperCase();
    const toUpper = to.toUpperCase();

    logger.info(`Fetching exchange rate: ${fromUpper} -> ${toUpper}`);

    const response = await axios.get(`${EXCHANGE_RATE_URL}/${fromUpper}`, {
      timeout: 10000
    });

    if (response.data.result !== 'success') {
      logger.error(`ExchangeRate API error: ${response.data.result}`);
      throw new Error('Failed to fetch exchange rate');
    }

    const rate = response.data.rates[toUpper];

    if (!rate) {
      logger.warn(`Currency not found: ${toUpper}`);
      throw new Error('Currency not found');
    }

    const result = {
      from: fromUpper,
      to: toUpper,
      rate,
      date: new Date(response.data.time_last_update_unix * 1000).toISOString().split('T')[0],
      timestamp: response.data.time_last_update_unix
    };

    logger.info(`Exchange rate retrieved: ${fromUpper}/${toUpper} = ${rate}`);
    return result;
  } catch (error) {
    if (error.message === 'Currency not found') {
      throw error;
    }
    logger.error(`Currency API error:`, { error: error.message });
    throw new Error('Failed to fetch currency exchange rate');
  }
}

async function convertCurrency(amount, from, to) {
  try {
    if (typeof amount !== 'number' || amount <= 0) {
      throw new Error('Amount must be a positive number');
    }

    logger.info(`Converting ${amount} ${from} to ${to}`);

    const exchangeData = await getExchangeRate(from, to);
    const convertedAmount = amount * exchangeData.rate;

    const result = {
      original_amount: amount,
      original_currency: from.toUpperCase(),
      converted_amount: parseFloat(convertedAmount.toFixed(2)),
      converted_currency: to.toUpperCase(),
      rate: exchangeData.rate,
      date: exchangeData.date
    };

    logger.info(`Conversion successful: ${amount} ${from} = ${result.converted_amount} ${to}`);
    return result;
  } catch (error) {
    logger.error(`Currency conversion error:`, { error: error.message });
    throw error;
  }
}

async function getAllRates(baseCurrency) {
  try {
    const baseUpper = baseCurrency.toUpperCase();
    logger.info(`Fetching all rates for base currency: ${baseUpper}`);

    const response = await axios.get(`${EXCHANGE_RATE_URL}/${baseUpper}`, {
      timeout: 10000
    });

    if (response.data.result !== 'success') {
      logger.error(`ExchangeRate API error: ${response.data.result}`);
      throw new Error('Failed to fetch exchange rates');
    }

    const result = {
      base_currency: baseUpper,
      rates: response.data.rates,
      date: new Date(response.data.time_last_update_unix * 1000).toISOString().split('T')[0],
      total_currencies: Object.keys(response.data.rates).length
    };

    logger.info(`All rates retrieved for ${baseUpper}: ${result.total_currencies} currencies`);
    return result;
  } catch (error) {
    logger.error(`Get all rates error:`, { error: error.message });
    throw new Error('Failed to fetch all exchange rates');
  }
}

module.exports = { getExchangeRate, convertCurrency, getAllRates };
