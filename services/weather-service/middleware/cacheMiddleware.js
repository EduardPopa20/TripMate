const { getCache, setCache } = require('../../../shared/config/redisClient');
const logger = require('../../../shared/utils/logger');

const CACHE_TTL = 900;

async function cacheMiddleware(req, res, next) {
  const { city } = req.params;
  const cacheKey = `weather:${city.toLowerCase()}`;

  try {
    const cached = await getCache(cacheKey);

    if (cached) {
      logger.info(`Cache HIT for ${cacheKey}`);
      req.cached = true;
      return res.json({
        success: true,
        data: cached,
        cached: true
      });
    }

    logger.info(`Cache MISS for ${cacheKey}`);

    const originalJson = res.json.bind(res);
    res.json = (data) => {
      if (data.success && data.data) {
        setCache(cacheKey, data.data, CACHE_TTL).catch(err => {
          logger.error(`Cache SET error for ${cacheKey}:`, err);
        });
      }
      return originalJson(data);
    };

    next();
  } catch (error) {
    logger.error(`Cache middleware error:`, error);
    next();
  }
}

module.exports = cacheMiddleware;
