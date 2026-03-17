import express from 'express';

import cors from 'cors';

import helmet from 'helmet';

import rateLimit from 'express-rate-limit';

import { createServer } from 'http';

import { Server } from 'socket.io';

import dotenv from 'dotenv';



import { connectDB } from './config/database';

import authRoutes from './routes/auth';

import userRoutes from './routes/users';

import chatRoutes from './routes/chats';

import contactRoutes from './routes/contacts';

import meetingRoutes from './routes/meetings';

import postRoutes from './routes/posts';

import { errorHandler } from './middleware/errorHandler';

import { initializeSocket } from './socket/socket';



dotenv.config();



const app = express();

const server = createServer(app);

const io = new Server(server, {

  cors: {

    origin: process.env.FRONTEND_URL || "http://localhost:3000",

    methods: ["GET", "POST"]

  }

});



// Connect to database

connectDB();



// Security middleware

app.use(helmet());

app.use(cors({

  origin: process.env.FRONTEND_URL || "http://localhost:3000",

  credentials: true

}));



// Rate limiting

const limiter = rateLimit({

  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'), // 1 minute for testing

  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'), // 1000 requests for testing

  message: 'Too many requests from this IP, please try again later.'

});

app.use('/api/', limiter);



// Body parsing

app.use(express.json({ limit: '10mb' }));

app.use(express.urlencoded({ extended: true }));



// Serve static files

app.use('/uploads', express.static(process.env.UPLOAD_PATH || './uploads'));



// Routes

app.use('/api/auth', authRoutes);

app.use('/api/users', userRoutes);

app.use('/api/chats', chatRoutes);

app.use('/api/contacts', contactRoutes);

app.use('/api/meetings', meetingRoutes);

app.use('/api/posts', postRoutes);



// Health check

app.get('/api/health', (req, res) => {

  res.json({ status: 'OK', timestamp: new Date().toISOString() });

});



// Error handling

app.use(errorHandler);



// Initialize Socket.IO

initializeSocket(io);



const PORT = process.env.PORT || 5000;



server.listen(PORT, () => {

  console.log(`🚀 Server running on port ${PORT}`);

  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);

});



export default app;