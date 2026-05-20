import redis from '../config/redis.js';
import logger from '../utils/logger.js';

/**
 * Token Bucket Rate Limiter (User-Based)
 * Refills tokens at a constant rate. Requests consume tokens.
 */
const tokenBucketLimiter = async (req, res, next) => {
    const userId = req.user._id.toString();
    const key = `token:${userId}`;
    
    const capacity = 5;
    const refillRate = capacity / 60; // 5 tokens per 60 seconds
    const now = Date.now();

    try {
        const bucket = await redis.hgetall(key);
        
        let tokens;
        let lastRefill;

        if (!bucket || Object.keys(bucket).length === 0) {
            tokens = capacity;
            lastRefill = now;
        } else {
            tokens = parseFloat(bucket.tokens);
            lastRefill = parseInt(bucket.lastRefill);

            const elapsed = (now - lastRefill) / 1000;
            const refill = elapsed * refillRate;
            tokens = Math.min(capacity, tokens + refill);
            lastRefill = now;
        }

        const remaining = Math.floor(tokens);
        const retryAfter = tokens < 1 ? Math.ceil((1 - tokens) / refillRate) : 0;

        res.setHeader('X-RateLimit-Limit', capacity);
        res.setHeader('X-RateLimit-Remaining', remaining);
        res.setHeader('Retry-After', retryAfter);

        if (tokens < 1) {
            logger.warn(`Token Bucket Blocked`, { userId, tokens });
            
            logger.dbLog({
                userId,
                endpoint: req.originalUrl,
                algorithm: 'Token Bucket',
                status: 'BLOCKED',
                details: { tokens, capacity }
            });

            return res.status(429).json({
                success: false,
                message: "Rate limit exceeded"
            });
        }

        tokens -= 1;

        await redis.hset(key, 'tokens', tokens, 'lastRefill', lastRefill);
        await redis.pexpire(key, 60000);

        logger.info(`Token Bucket Allowed`, { userId, remaining: Math.floor(tokens) });

        logger.dbLog({
            userId,
            endpoint: req.originalUrl,
            algorithm: 'Token Bucket',
            status: 'ALLOWED',
            details: { remaining: Math.floor(tokens) }
        });

        next();
    } catch (error) {
        logger.error('Token Bucket Error:', error);
        next();
    }
};

export default tokenBucketLimiter;
