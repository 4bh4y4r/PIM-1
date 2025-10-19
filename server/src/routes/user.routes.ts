import express from 'express';
import { getAllUsers, getUserById, updateUser, deleteUser, updateUserRole } from '../controllers/user.controller';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Admin-only routes
router.get('/', authorizeAdmin, getAllUsers);
router.get('/:id', authorizeAdmin, getUserById);
router.put('/:id', authorizeAdmin, updateUser);
router.put('/:id/role', authorizeAdmin, updateUserRole);
router.delete('/:id', authorizeAdmin, deleteUser);

export default router;