import express from 'express';
import * as userController from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';
import slidingWindowLimiter from '../middlewares/slidingWindowLimiter.js';
import tokenBucketLimiter from '../middlewares/tokenBucketLimiter.js';

const router = express.Router();

// Public routes (No rate limiting as per instructions)
router.post('/signup', userController.signup);
router.post('/signin', userController.signin);

// Protected routes with User-Based Rate Limiting
router.get('/', protect, slidingWindowLimiter, userController.getAllUsers);
router.get('/:id', protect, slidingWindowLimiter, userController.getUserById);

// Update/Delete with Token Bucket (Controlled)
router.put('/:id', protect, tokenBucketLimiter, userController.updateUser);
router.delete('/:id', protect, tokenBucketLimiter, userController.deleteUser);

export default router;
