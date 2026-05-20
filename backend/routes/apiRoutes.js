import express from 'express';
import * as apiController from '../controllers/apiController.js';
import { protect } from '../middlewares/authMiddleware.js';
import fixedWindowLimiter from '../middlewares/fixedWindowLimiter.js';
import slidingWindowLimiter from '../middlewares/slidingWindowLimiter.js';
import tokenBucketLimiter from '../middlewares/tokenBucketLimiter.js';
import leakyBucketLimiter from '../middlewares/leakyBucketLimiter.js';

const router = express.Router();

// Routes for testing each algorithm - Protect middleware applied first
router.get('/fixed', protect, fixedWindowLimiter, apiController.handleFixed);
router.get('/sliding', protect, slidingWindowLimiter, apiController.handleSliding);
router.get('/token', protect, tokenBucketLimiter, apiController.handleToken);
router.get('/leaky', protect, leakyBucketLimiter, apiController.handleLeaky);

// Analytics & Logs - Protected
router.get('/logs', protect, apiController.getLogs);
router.get('/stats', protect, apiController.getStats);

// Blacklist Management - Protected
router.post('/blacklist', protect, apiController.toggleBlacklist);

export default router;
