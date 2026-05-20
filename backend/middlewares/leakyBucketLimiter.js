import redis from '../config/redis.js';
import logger from '../utils/logger.js';

/**
 * Leaky Bucket Rate Limiter (User-Based)
 * Requests are added to the bucket. The bucket "leaks" at a constant rate.
 */
const leakyBucketLimiter = async (req, res, next) => {
    const userId = req.user._id.toString();
    const key = `leaky:${userId}`;
    
    const capacity = 5;
    const leakRate = capacity / 60; // leaks per second
    const now = Date.now();

    try {
        const bucket = await redis.hgetall(key);
        
        let currentLevel;
        let lastUpdate;

        if (!bucket || Object.keys(bucket).length === 0) {
            currentLevel = 0;
            lastUpdate = now;
        } else {
            currentLevel = parseFloat(bucket.level);
            lastUpdate = parseInt(bucket.lastUpdate);

            const elapsed = (now - lastUpdate) / 1000;
            const leak = elapsed * leakRate;
            currentLevel = Math.max(0, currentLevel - leak);
            lastUpdate = now;
        }

        const remaining = Math.max(0, capacity - Math.floor(currentLevel + 1));
        const retryAfter = currentLevel + 1 > capacity ? Math.ceil((currentLevel + 1 - capacity) / leakRate) : 0;

        res.setHeader('X-RateLimit-Limit', capacity);
        res.setHeader('X-RateLimit-Remaining', remaining);
        res.setHeader('Retry-After', retryAfter);

        if (currentLevel + 1 > capacity) {
            logger.warn(`Leaky Bucket Overflow`, { userId, level: currentLevel });
            
            logger.dbLog({
                userId,
                endpoint: req.originalUrl,
                algorithm: 'Leaky Bucket',
                status: 'BLOCKED',
                details: { level: currentLevel, capacity }
            });

            return res.status(429).json({
                success: false,
                message: "Rate limit exceeded"
            });
        }

        currentLevel += 1;

        await redis.hset(key, 'level', currentLevel, 'lastUpdate', lastUpdate);
        await redis.pexpire(key, 60000);

        logger.info(`Leaky Bucket Allowed`, { userId, remaining });

        logger.dbLog({
            userId,
            endpoint: req.originalUrl,
            algorithm: 'Leaky Bucket',
            status: 'ALLOWED',
            details: { remaining }
        });

        next();
    } catch (error) {
        logger.error('Leaky Bucket Error:', error);
        next();
    }
};

export default leakyBucketLimiter;
