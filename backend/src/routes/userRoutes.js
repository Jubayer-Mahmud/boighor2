import express from 'express';
import {
  registerUser, loginUser, getUserProfile, updateUserProfile,
  getMe, updateMe, changePassword, updateDefaultAddress,
} from '../controllers/userController.js';
import { verifyUserToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Legacy protected routes
router.get('/profile', verifyUserToken, getUserProfile);
router.put('/profile', verifyUserToken, updateUserProfile);

// Profile dashboard routes
router.get('/me', verifyUserToken, getMe);
router.put('/me', verifyUserToken, updateMe);
router.put('/me/password', verifyUserToken, changePassword);
router.put('/me/address', verifyUserToken, updateDefaultAddress);

export default router;
