import express from 'express';
import { uploadProfileImage } from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth.middleware';
import { upload } from '../utils/upload.utils';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Upload profile image route
router.post('/:personId/profile-image', upload.single('profileImage'), uploadProfileImage);

export default router;