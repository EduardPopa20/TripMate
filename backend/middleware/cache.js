const NodeCache = require('node-cache');

const weatherCache = new NodeCache({ stdTTL: 900 });
const placesCache = new NodeCache({ stdTTL: 86400 });
const currencyCache = new NodeCache({ stdTTL: 3600 });

const cacheMiddleware = (cacheType) => {
  return (req, res, next) => {
    let cache;

    switch(cacheType) {
      case 'weather':
        cache = weatherCache;
        break;
      case 'places':
        cache = placesCache;
        break;
      case 'currency':
        cache = currencyCache;
        break;
      default:
        return next();
    }

    const key = req.originalUrl || req.url;
    const cachedData = cache.get(key);

    if (cachedData) {
      return res.json({ data: cachedData, cached: true });
    }

    res.sendCachedResponse = (data) => {
      cache.set(key, data);
      res.json({ data, cached: false });
    };

    next();
  };
};

module.exports = { cacheMiddleware, weatherCache, placesCache, currencyCache };
