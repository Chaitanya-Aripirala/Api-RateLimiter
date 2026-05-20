import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import apiRoutes from './routes/apiRoutes.js';
import logger from './utils/logger.js';
import connectDB from './config/db.js';
import Log from './models/Log.js';
import './config/redis.js';
import userRoutes from './routes/userRoutes.js';

import blacklistMiddleware from './middlewares/blacklistMiddleware.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Standard middlewares
app.use(cors({
  origin: '*', // Allow all origins for testing
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'Retry-After']
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(blacklistMiddleware);

// Routes
app.use('/api', apiRoutes);
app.use('/api/users', userRoutes);


// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'API Rate Limiter System is Running',
        status: 'Active',
        endpoints: [
            '/api/fixed',
            '/api/sliding',
            '/api/token',
            '/api/leaky'
        ]
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Unhandled Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`\n🚀 Server listening on http://localhost:${PORT}`);
    console.log(`🔧 Rate Limit: ${process.env.RATE_LIMIT || 100} req / ${process.env.WINDOW_SIZE || 60000} ms\n`);
});
