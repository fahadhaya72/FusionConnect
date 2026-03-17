import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

let isConnected = false;

export const connectDB = async () => {
  const maxRetries = 5;
  const retryDelay = 5000; // 5 seconds

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await prisma.$connect();
      isConnected = true;
      logger.info('✅ Database connected successfully');
      
      // Test the connection
      await prisma.$queryRaw`SELECT 1`;
      logger.info('✅ Database connection verified');
      return;
    } catch (error) {
      logger.error(`❌ Database connection attempt ${attempt}/${maxRetries} failed:`, error);
      
      if (attempt === maxRetries) {
        logger.error('🚨 CRITICAL: Database connection failed after all retries');
        logger.error('📊 Application will continue in degraded mode');
        
        // Don't exit - continue in degraded mode
        // Add health check endpoint to reflect DB status
        return;
      }
      
      logger.info(`🔄 Retrying database connection in ${retryDelay/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
};

export const checkDatabaseHealth = async () => {
  if (!isConnected) return false;
  
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    isConnected = false;
    logger.error('Database health check failed:', error);
    return false;
  }
};

export default prisma;