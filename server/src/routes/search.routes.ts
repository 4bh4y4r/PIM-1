import express from 'express';
import { searchPersons, getPersonStats } from '../controllers/search.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// All search routes require authentication
router.use(authenticate);

// Search routes
router.get('/persons', searchPersons);
router.get('/stats', getPersonStats);

export default router;