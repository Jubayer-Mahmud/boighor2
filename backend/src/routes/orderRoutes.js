import express from 'express';
import {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getMyOrders,
  getMyOrderById,
  cancelMyOrder,
} from '../controllers/orderController.js';
import { verifyUserToken, verifyAdminToken, optionalUserToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/orders — guest or logged-in checkout
router.post('/', optionalUserToken, createOrder);

// User — my orders (must come before /:id to avoid conflict)
router.get('/my', verifyUserToken, getMyOrders);
router.get('/my/:id', verifyUserToken, getMyOrderById);
router.patch('/my/:id/cancel', verifyUserToken, cancelMyOrder);

// Legacy user route
router.get('/user/orders', verifyUserToken, getUserOrders);

// Generic single order (public/legacy)
router.get('/:id', getOrderById);

// Admin routes
router.get('/', verifyAdminToken, getAllOrders);
router.put('/:id/status', verifyAdminToken, updateOrderStatus);

export default router;
