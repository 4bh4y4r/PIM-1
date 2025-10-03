import express from 'express';
import { 
  getActivityLogs, 
  getPersonActivityLogs, 
  getActivityStats 
} from '../controllers/activity.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Activity log routes
router.get('/', getActivityLogs);
router.get('/person/:personId', getPersonActivityLogs);
router.get('/stats', getActivityStats);

export default router;