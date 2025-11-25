const { getExchangeRate, convertCurrency } = require('../services/currencyService');

async function getCurrency(req, res) {
  try {
    const { from, to } = req.params;

    if (!from || !to) {
      return res.status(400).json({ error: 'From and to currency codes are required' });
    }

    const rateData = await getExchangeRate(from, to);

    if (res.sendCachedResponse) {
      res.sendCachedResponse(rateData);
    } else {
      res.json({ data: rateData });
    }
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    res.status(500).json({ error: 'Failed to fetch exchange rate' });
  }
}

async function convertAmount(req, res) {
  try {
    const { amount, from, to } = req.query;

    if (!amount || !from || !to) {
      return res.status(400).json({ error: 'Amount, from, and to parameters are required' });
    }

    const conversionData = await convertCurrency(parseFloat(amount), from, to);

    res.json({ data: conversionData });
  } catch (error) {
    console.error('Error converting currency:', error);
    res.status(500).json({ error: 'Failed to convert currency' });
  }
}

module.exports = { getCurrency, convertAmount };
