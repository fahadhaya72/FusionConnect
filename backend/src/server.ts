import express from 'express';

import cors from 'cors';

import helmet from 'helmet';

import rateLimit from 'express-rate-limit';

import { createServer } from 'http';

import { Server } from 'socket.io';

import dotenv from 'dotenv';



import { connectDB, checkDatabaseHealth } from './config/database';

import authRoutes from './routes/auth';

import userRoutes from './routes/users';

import chatRoutes from './routes/chats';

import contactRoutes from './routes/contacts';

import meetingRoutes from './routes/meetings';

import postRoutes from './routes/posts';

import { errorHandler } from './middleware/errorHandler';

import { requestLogger } from './middleware/requestLogger';

import { initializeSocket } from './socket/socket';

import logger from './utils/logger';



dotenv.config();



// Validate required environment variables

const requiredEnvVars = [

  'JWT_SECRET',

  'JWT_REFRESH_SECRET',

  'DATABASE_URL',

  'FRONTEND_URL'

];



for (const envVar of requiredEnvVars) {

  if (!process.env[envVar]) {

    logger.error(`❌ Missing required environment variable: ${envVar}`);

    process.exit(1);

  }

}



logger.info('✅ Environment variables validated');

const app = express();

// Trust proxy for production (behind reverse proxy)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

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

// Secure CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:5173'
].filter(Boolean) as string[];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Total-Count']
};

app.use(cors(corsOptions));



// General rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 100 requests
  message: 'Too many requests from this IP, please try again later.'
});

// Auth-specific rate limiting (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Email verification rate limiting (very strict)
const emailVerificationLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3, // 3 attempts per 10 minutes
  message: 'Too many verification attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);
app.use('/api/auth', authLimiter);
app.use('/api/auth/verify-email', emailVerificationLimiter);


// Body parsing - reduced for security
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Request logging
app.use(requestLogger);

// Serve static files with security headers
app.use('/uploads', express.static(process.env.UPLOAD_PATH || './uploads', {
  maxAge: '1d', // Cache for 1 day
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    // Security headers for static files
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Only allow certain file types to be served
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'];
    const fileExtension = path.toLowerCase().substring(path.lastIndexOf('.'));
    
    if (!allowedExtensions.includes(fileExtension)) {
      res.status(403).json({ error: 'File type not allowed' });
      return;
    }
  }
}));


// Routes

app.use('/api/auth', authRoutes);

app.use('/api/users', userRoutes);

app.use('/api/chats', chatRoutes);

app.use('/api/contacts', contactRoutes);

app.use('/api/meetings', meetingRoutes);

app.use('/api/posts', postRoutes);



// Health check

app.get('/api/health', async (req, res) => {
  const dbHealthy = await checkDatabaseHealth();
  
  const health = {
    status: dbHealthy ? 'OK' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    database: {
      connected: dbHealthy,
      status: dbHealthy ? 'healthy' : 'unhealthy'
    },
    uptime: process.uptime(),
    memory: process.memoryUsage()
  };

  res.status(dbHealthy ? 200 : 503).json(health);
});



// Error handling

app.use(errorHandler);



// Initialize Socket.IO

initializeSocket(io);



const PORT = process.env.PORT || 5000;



server.listen(PORT, () => {

  logger.info(`🚀 Server running on port ${PORT}`);

  logger.info(`📊 Health check: http://localhost:${PORT}/api/health`);

});



export default app;