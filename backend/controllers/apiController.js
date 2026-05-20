import Log from '../models/Log.js';
import redis from '../config/redis.js';
import logger from '../utils/logger.js';

/**
 * Controller for API endpoints
 */

// Fetch logs with pagination and filtering
export const getLogs = async (req, res) => {
    try {
        const { page = 1, limit = 20, algorithm, status, ip, userId } = req.query;
        const query = {};
        
        if (algorithm) query.algorithm = algorithm;
        if (status) query.status = status;
        if (ip) query.ip = ip;
        if (userId) query.userId = userId;

        const logs = await Log.find(query)
            .sort({ timestamp: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Log.countDocuments(query);

        res.json({
            logs,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            totalLogs: count
        });
    } catch (error) {
        logger.error('Fetch Logs Error:', error);
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
};

// Get Analytics Stats
export const getStats = async (req, res) => {
    try {
        const stats = await Log.aggregate([
            {
                $group: {
                    _id: { algorithm: '$algorithm', status: '$status' },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Format stats for easier consumption
        const formattedStats = stats.reduce((acc, curr) => {
            const { algorithm, status } = curr._id;
            if (!acc[algorithm]) acc[algorithm] = { ALLOWED: 0, BLOCKED: 0 };
            acc[algorithm][status] = curr.count;
            return acc;
        }, {});

        res.json(formattedStats);
    } catch (error) {
        logger.error('Fetch Stats Error:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
};

// Toggle IP Blacklist
export const toggleBlacklist = async (req, res) => {
    try {
        const { ip, action } = req.body; // action: 'block' or 'unblock'
        if (!ip) return res.status(400).json({ error: 'IP address is required' });

        const key = `blacklist:${ip}`;

        if (action === 'block') {
            await redis.set(key, 'true');
            logger.warn(`IP ${ip} blacklisted manually`);
            res.json({ message: `IP ${ip} has been blacklisted` });
        } else {
            await redis.del(key);
            logger.info(`IP ${ip} removed from blacklist`);
            res.json({ message: `IP ${ip} has been removed from blacklist` });
        }
    } catch (error) {
        logger.error('Toggle Blacklist Error:', error);
        res.status(500).json({ error: 'Failed to update blacklist' });
    }
};

// Success Handlers for testing
export const handleFixed = (req, res) => {
    res.json({
        message: 'Success: Request passed Fixed Window Rate Limiter',
        algorithm: 'Fixed Window',
        timestamp: new Date().toISOString()
    });
};

export const handleSliding = (req, res) => {
    res.json({
        message: 'Success: Request passed Sliding Window Rate Limiter',
        algorithm: 'Sliding Window',
        timestamp: new Date().toISOString()
    });
};

export const handleToken = (req, res) => {
    res.json({
        message: 'Success: Request passed Token Bucket Rate Limiter',
        algorithm: 'Token Bucket',
        timestamp: new Date().toISOString()
    });
};

export const handleLeaky = (req, res) => {
    res.json({
        message: 'Success: Request passed Leaky Bucket Rate Limiter',
        algorithm: 'Leaky Bucket',
        timestamp: new Date().toISOString()
    });
};
