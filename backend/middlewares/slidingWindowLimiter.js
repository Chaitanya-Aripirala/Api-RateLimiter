import redis from '../config/redis.js';
import logger from '../utils/logger.js';

/**
 * Sliding Window Rate Limiter (User-Based)
 * Uses Redis Sorted Sets to track requests within a moving time window.
 */
const slidingWindowLimiter = async (req, res, next) => {
    const userId = req.user._id.toString();
    const key = `sliding:${userId}`;
    const now = Date.now();
    const limit = 5;
    const windowSize = 60000;
    const windowStart = now - windowSize;

    try {
        const pipeline = redis.pipeline();
        
        // Remove old requests outside the window
        pipeline.zremrangebyscore(key, 0, windowStart);
        // Add current request
        pipeline.zadd(key, now, `${now}-${Math.random()}`);
        // Count total requests in window
        pipeline.zcard(key);
        // Set expiry for the key
        pipeline.pexpire(key, windowSize);

        const results = await pipeline.exec();
        const requestCount = results[2][1];

        const remaining = Math.max(0, limit - requestCount);

        // Required headers
        res.setHeader('X-RateLimit-Limit', limit);
        res.setHeader('X-RateLimit-Remaining', remaining);
        
        // For sliding window, the retry-after is the time until the oldest request in the window falls out
        const oldestRequest = await redis.zrange(key, 0, 0, 'WITHSCORES');
        const retryAfter = oldestRequest.length > 0 ? Math.ceil((parseInt(oldestRequest[1]) + windowSize - now) / 1000) : 0;
        res.setHeader('Retry-After', retryAfter > 0 ? retryAfter : 0);

        if (requestCount > limit) {
            logger.warn(`Sliding Window Blocked`, { userId, requestCount });
            
            logger.dbLog({
                userId,
                endpoint: req.originalUrl,
                algorithm: 'Sliding Window',
                status: 'BLOCKED',
                details: { requestCount, limit }
            });

            return res.status(429).json({
                success: false,
                message: "Rate limit exceeded"
            });
        }

        logger.info(`Sliding Window Allowed`, { userId, remaining });

        logger.dbLog({
            userId,
            endpoint: req.originalUrl,
            algorithm: 'Sliding Window',
            status: 'ALLOWED',
            details: { remaining }
        });

        next();
    } catch (error) {
        logger.error('Sliding Window Error:', error);
        next();
    }
};

export default slidingWindowLimiter;
