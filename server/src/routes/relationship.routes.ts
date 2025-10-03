import express from 'express';
import { 
  createRelationship, 
  getPersonRelationships, 
  updateRelationship, 
  deleteRelationship 
} from '../controllers/relationship.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Relationship routes
router.post('/', createRelationship);
router.get('/person/:personId', getPersonRelationships);
router.put('/:id', updateRelationship);
router.delete('/:id', deleteRelationship);

export default router;