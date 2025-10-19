import express from 'express';
import { 
  createPerson, 
  getPersons, 
  getPersonById, 
  updatePerson, 
  deletePerson,
  backfillPersonTags
} from '../controllers/person.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// All person routes require authentication
router.use(authenticate);

// CRUD routes
router.post('/', createPerson);
router.get('/', getPersons);
router.get('/:id', getPersonById);
router.put('/:id', updatePerson);
router.delete('/:id', deletePerson);
// Admin or user-scoped backfill of tags based on data
router.post('/backfill/tags', backfillPersonTags);

export default router;