import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../controllers/cartController.js';
import { verifyUserToken } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected - require user authentication
router.get('/', verifyUserToken, getCart);
router.post('/', verifyUserToken, addToCart);
router.put('/', verifyUserToken, updateCartItem);
router.delete('/:productId', verifyUserToken, removeFromCart);
router.delete('/', verifyUserToken, clearCart);

export default router;
