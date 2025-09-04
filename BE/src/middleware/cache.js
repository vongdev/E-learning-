const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // Default TTL: 5 minutes

/**
 * Middleware for caching API responses
 * @param {number} duration - Cache duration in seconds
 */
const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    // Create a cache key from the request URL and query params
    const cacheKey = `${req.originalUrl || req.url}`;
    
    // Check if we have a cache hit
    const cachedResponse = cache.get(cacheKey);
    
    if (cachedResponse) {
      // Send cached response
      res.json(cachedResponse);
      return;
    }
    
    // Store the original json method
    const originalJson = res.json;
    
    // Override the json method
    res.json = (body) => {
      // Store the response in cache
      cache.set(cacheKey, body, duration);
      
      // Call the original json method
      return originalJson.call(res, body);
    };
    
    next();
  };
};

/**
 * Helper function to clear the entire cache
 */
const clearCache = () => {
  cache.flushAll();
};

/**
 * Helper function to clear a specific cache key
 * @param {string} key - The cache key to clear
 */
const clearCacheKey = (key) => {
  cache.del(key);
};

module.exports = {
  cacheMiddleware,
  clearCache,
  clearCacheKey
};