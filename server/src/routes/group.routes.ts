import express from 'express';
import { 
  createGroup, 
  getGroups, 
  getGroupById, 
  updateGroup, 
  deleteGroup,
  addPersonToGroup,
  removePersonFromGroup
} from '../controllers/group.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Group CRUD routes
router.post('/', createGroup);
router.get('/', getGroups);
router.get('/:id', getGroupById);
router.put('/:id', updateGroup);
router.delete('/:id', deleteGroup);

// Group membership routes
router.post('/:groupId/members/:personId', addPersonToGroup);
router.delete('/:groupId/members/:personId', removePersonFromGroup);

export default router;