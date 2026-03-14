import express from 'express';
import { protect } from '../middleware/auth';
import { getProfile, updateProfile, getUsers, searchUsers } from '../controllers/users';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/', getUsers);
router.get('/search', searchUsers);

export default router;