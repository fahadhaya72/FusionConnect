import express from 'express';
import { protect } from '../middleware/auth';
import { getContacts, sendContactRequest, acceptContactRequest, rejectContactRequest, removeContact } from '../controllers/contacts';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/', getContacts);
router.post('/request', sendContactRequest);
router.post('/accept/:requestId', acceptContactRequest);
router.post('/reject/:requestId', rejectContactRequest);
router.delete('/:contactId', removeContact);

export default router;