import express from 'express';
import { getAllUsers, getUserById, updateUser, deleteUser } from '../controllers/user.controller';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Admin-only routes
router.get('/', authorizeAdmin, getAllUsers);
router.get('/:id', authorizeAdmin, getUserById);
router.put('/:id', authorizeAdmin, updateUser);
router.delete('/:id', authorizeAdmin, deleteUser);

export default router;