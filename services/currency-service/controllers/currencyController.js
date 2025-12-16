const { getExchangeRate, convertCurrency, getAllRates } = require('../services/currencyService');
const logger = require('../../../shared/utils/logger');

async function getCurrency(req, res, next) {
  try {
    const { from, to } = req.params;

    if (!from || !to) {
      return res.status(400).json({
        error: 'From and to currency codes are required'
      });
    }

    logger.info(`Currency request: ${from} -> ${to}`);

    const rateData = await getExchangeRate(from, to);

    res.json({
      success: true,
      data: rateData,
      cached: req.cached || false
    });
  } catch (error) {
    if (error.message === 'Currency not found') {
      return res.status(404).json({
        error: {
          message: 'Currency not found',
          status: 404
        }
      });
    }

    logger.error(`Currency controller error:`, { error: error.message });
    next(error);
  }
}

async function convertAmount(req, res, next) {
  try {
    const { amount, from, to } = req.body;

    if (!amount || !from || !to) {
      return res.status(400).json({
        error: 'Amount, from, and to currency codes are required'
      });
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({
        error: 'Amount must be a positive number'
      });
    }

    logger.info(`Convert request: ${amountNum} ${from} -> ${to}`);

    const conversionData = await convertCurrency(amountNum, from, to);

    res.json({
      success: true,
      data: conversionData
    });
  } catch (error) {
    if (error.message === 'Currency not found') {
      return res.status(404).json({
        error: {
          message: 'Currency not found',
          status: 404
        }
      });
    }

    logger.error(`Convert controller error:`, { error: error.message });
    next(error);
  }
}

async function getRates(req, res, next) {
  try {
    const { base } = req.params;

    if (!base) {
      return res.status(400).json({
        error: 'Base currency code is required'
      });
    }

    logger.info(`All rates request for base: ${base}`);

    const ratesData = await getAllRates(base);

    res.json({
      success: true,
      data: ratesData,
      cached: req.cached || false
    });
  } catch (error) {
    logger.error(`Get rates controller error:`, { error: error.message });
    next(error);
  }
}

module.exports = { getCurrency, convertAmount, getRates };
