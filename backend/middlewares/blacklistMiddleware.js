import redis from '../config/redis.js';
import logger from '../utils/logger.js';

/**
 * Global IP Blacklist Middleware
 * Checks if the requesting IP is in the Redis blacklist.
 */
const blacklistMiddleware = async (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const key = `blacklist:${ip}`;

    try {
        const isBlacklisted = await redis.get(key);

        if (isBlacklisted) {
            logger.warn(`Access Denied: IP ${ip} is blacklisted`);
            return res.status(403).json({
                error: 'Access Denied',
                message: 'Your IP address has been blacklisted.',
                ip
            });
        }

        next();
    } catch (error) {
        logger.error('Blacklist Middleware Error:', error);
        next();
    }
};

export default blacklistMiddleware;
