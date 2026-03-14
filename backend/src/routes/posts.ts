import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/auth';
import { getPosts, createPost, getUserPosts, deletePost } from '../controllers/posts';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_PATH || './uploads');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.mimetype.split('/')[1]);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880') }, // 5MB default
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  }
});

// All routes require authentication
router.use(protect);

router.get('/', getPosts);
router.post('/', upload.single('media'), createPost);
router.get('/user/:userId', getUserPosts);
router.delete('/:id', deletePost);

export default router;