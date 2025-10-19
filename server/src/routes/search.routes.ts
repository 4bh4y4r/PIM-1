import express from 'express';
import { searchPersons, getPersonStats, getDemographicStats, getDashboardStats } from '../controllers/search.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// All search routes require authentication
router.use(authenticate);

// Search routes
router.get('/persons', searchPersons);
router.get('/stats', getPersonStats);
router.get('/demographics', getDemographicStats);
router.get('/dashboard', getDashboardStats);

export default router;