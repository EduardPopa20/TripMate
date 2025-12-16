const redis = require('redis');
const logger = require('../utils/logger');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = redis.createClient({
  url: redisUrl,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        logger.error('Redis reconnection failed after 10 retries');
        return new Error('Redis reconnection limit reached');
      }
      const delay = Math.min(retries * 100, 3000);
      logger.warn(`Redis reconnecting in ${delay}ms (attempt ${retries})`);
      return delay;
    }
  }
});

redisClient.on('error', (err) => {
  logger.error('Redis client error:', err);
});

redisClient.on('connect', () => {
  logger.info('Redis client connected');
});

redisClient.on('ready', () => {
  logger.info('Redis client ready');
});

redisClient.on('reconnecting', () => {
  logger.warn('Redis client reconnecting...');
});

async function connectRedis() {
  try {
    await redisClient.connect();
    logger.info('Redis connection established');
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    throw error;
  }
}

async function getCache(key) {
  try {
    const value = await redisClient.get(key);
    if (value) {
      logger.debug(`Cache HIT for key: ${key}`);
      return JSON.parse(value);
    }
    logger.debug(`Cache MISS for key: ${key}`);
    return null;
  } catch (error) {
    logger.error(`Cache GET error for key ${key}:`, error);
    return null;
  }
}

async function setCache(key, value, ttlSeconds) {
  try {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await redisClient.setEx(key, ttlSeconds, serialized);
    } else {
      await redisClient.set(key, serialized);
    }
    logger.debug(`Cache SET for key: ${key} (TTL: ${ttlSeconds || 'none'}s)`);
    return true;
  } catch (error) {
    logger.error(`Cache SET error for key ${key}:`, error);
    return false;
  }
}

async function deleteCache(key) {
  try {
    await redisClient.del(key);
    logger.debug(`Cache DELETE for key: ${key}`);
    return true;
  } catch (error) {
    logger.error(`Cache DELETE error for key ${key}:`, error);
    return false;
  }
}

async function flushCache() {
  try {
    await redisClient.flushAll();
    logger.info('Redis cache flushed');
    return true;
  } catch (error) {
    logger.error('Cache FLUSH error:', error);
    return false;
  }
}

module.exports = {
  redisClient,
  connectRedis,
  getCache,
  setCache,
  deleteCache,
  flushCache
};
