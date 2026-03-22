import express from 'express';
import { protect } from '../middleware/auth';
import { 
  createCall, 
  getCall, 
  updateCallStatus, 
  getUserCalls, 
  endCall 
} from '../controllers/calls';

const router = express.Router();

// Create a new call
router.post('/', protect, createCall);

// Get call details
router.get('/:callId', protect, getCall);

// Update call status
router.put('/:callId/status', protect, updateCallStatus);

// Get user's call history
router.get('/history', protect, getUserCalls);

// End call
router.post('/:callId/end', protect, endCall);

export default router;
