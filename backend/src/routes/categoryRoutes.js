import express from 'express';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { verifyAdminToken } from '../middleware/auth.js';

const router = express.Router();

// Public
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

// Admin only
router.post('/', verifyAdminToken, createCategory);
router.put('/:id', verifyAdminToken, updateCategory);
router.delete('/:id', verifyAdminToken, deleteCategory);

export default router;
