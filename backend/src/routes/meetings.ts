import express from 'express';
import { protect } from '../middleware/auth';
import { getMeetings, createMeeting, updateMeeting, deleteMeeting, getMeetingDetails } from '../controllers/meetings';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/', getMeetings);
router.post('/', createMeeting);
router.get('/:id', getMeetingDetails);
router.put('/:id', updateMeeting);
router.delete('/:id', deleteMeeting);

export default router;