import express from 'express';

import { protect } from '../middleware/auth';

import { 
  getChats, 
  getChatMessages, 
  sendMessage, 
  createChat, 
  deleteGroup, 
  kickUser
} from '../controllers/chats';


const router = express.Router();



// All routes require authentication

router.use(protect);

router.get('/', getChats);

router.post('/', createChat);

router.get('/:chatId/messages', getChatMessages);

router.post('/:chatId/messages', sendMessage);

// Group management routes
router.delete('/:chatId', deleteGroup);

router.delete('/:chatId/participants/:userId', kickUser);



export default router;