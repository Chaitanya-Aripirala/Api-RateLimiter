import redis from '../config/redis.js';
import logger from '../utils/logger.js';

/**
 * Fixed Window Rate Limiter (User-Based)
 * 
 * WHY USER-BASED RATE LIMITING IS BETTER:
 * 1. Accuracy: In scalable systems, multiple users often share the same public IP (e.g., office networks, mobile towers).
 *    IP-based limiting would unfairly penalize all users if one user is abusive.
 * 2. Security: It prevents "noisy neighbor" issues where one authenticated user consumes all resources.
 * 3. Flexibility: Different users (Free vs Premium) can have different limits attached to their identity.
 */
const fixedWindowLimiter = async (req, res, next) => {
    // We assume protect middleware has already run and attached req.user
    const userId = req.user._id.toString();
    const key = `fixed:${userId}`;
    const limit = 5; // Fixed at 5 as per requirements
    const windowSize = 60000; // 1 minute in ms

    try {
        const requests = await redis.incr(key);

        if (requests === 1) {
            await redis.pexpire(key, windowSize);
        }

        const ttl = await redis.pttl(key);
        const retryAfter = Math.ceil(ttl / 1000);

        // Required headers
        res.setHeader('X-RateLimit-Limit', limit);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - requests));
        res.setHeader('Retry-After', retryAfter > 0 ? retryAfter : 0);

        if (requests > limit) {
            logger.warn(`Fixed Window Blocked`, { userId, requests });
            
            logger.dbLog({
                userId,
                endpoint: req.originalUrl,
                algorithm: 'Fixed Window',
                status: 'BLOCKED',
                details: { requests, limit }
            });

            return res.status(429).json({
                success: false,
                message: "Rate limit exceeded"
            });
        }

        logger.info(`Fixed Window Allowed`, { userId, remaining: limit - requests });

        logger.dbLog({
            userId,
            endpoint: req.originalUrl,
            algorithm: 'Fixed Window',
            status: 'ALLOWED',
            details: { remaining: limit - requests }
        });

        next();
    } catch (error) {
        logger.error('Fixed Window Error:', error);
        next();
    }
};

export default fixedWindowLimiter;
