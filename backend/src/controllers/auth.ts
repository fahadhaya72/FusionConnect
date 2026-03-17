import { Request, Response } from 'express';

import jwt from 'jsonwebtoken';

import prisma from '../config/database';

import { hashPassword, comparePassword } from '../utils/password';

import { generateToken, generateRefreshToken } from '../utils/jwt';

import { sendVerificationEmail } from '../utils/email';

import logger from '../utils/logger';



interface AuthRequest extends Request {

  user?: any;

}



// Generate 6-digit verification code

const generateVerificationCode = (): string => {

  return Math.floor(100000 + Math.random() * 900000).toString();

};



export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Generate verification code first
    const verificationCode = generateVerificationCode();

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Check if user exists within transaction
      const existingUser = await tx.user.findUnique({ where: { email } });
      if (existingUser) {
        throw new Error('User already exists');
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          verified: false
        },
        select: { id: true, name: true, email: true, verified: true }
      });

      // Store verification code
      await tx.verificationCode.create({
        data: {
          email,
          code: verificationCode,
          userId: user.id,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
        }
      });

      return user;
    });

    // Send verification email (outside transaction)
    try {
      await sendVerificationEmail(email, verificationCode);
    } catch (emailError) {
      logger.error('Email sending failed:', emailError);
      // Don't fail registration if email fails
    }

    res.status(201).json({
      success: true,
      data: {
        user: result,
        message: 'Registration successful. Please check your email for verification code.'
      }
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'User already exists') {
      return res.status(400).json({
        success: false,
        error: 'User already exists'
      });
    }

    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
};



export const login = async (req: Request, res: Response) => {

  try {

    const { email, password } = req.body;



    // Find user

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {

      return res.status(401).json({

        success: false,

        error: 'Invalid credentials'

      });

    }



    // Check password

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {

      return res.status(401).json({

        success: false,

        error: 'Invalid credentials'

      });

    }



    // Check if verified (temporarily disabled for testing)

    // if (!user.verified) {

    //   return res.status(403).json({

    //     success: false,

    //     error: 'Please verify your email first'

    //   });

    // }



    // Generate tokens

    const token = generateToken(user.id);

    const refreshToken = generateRefreshToken(user.id);



    res.json({

      success: true,

      data: {

        user: {

          id: user.id,

          name: user.name,

          email: user.email,

          avatar: user.avatar,

          verified: user.verified

        },

        token,

        refreshToken

      }

    });

  } catch (error) {

    logger.error('Login error:', error);

    res.status(500).json({

      success: false,

      error: 'Login failed'

    });

  }

};



export const verifyEmail = async (req: Request, res: Response) => {

  try {

    const { email, code } = req.body;



    const verificationData = await prisma.verificationCode.findUnique({

      where: { email }

    });



    if (!verificationData) {

      return res.status(400).json({

        success: false,

        error: 'Verification code not found or expired'

      });

    }



    if (Date.now() > verificationData.expiresAt.getTime()) {

      await prisma.verificationCode.delete({

        where: { email }

      });

      return res.status(400).json({

        success: false,

        error: 'Verification code expired'

      });

    }



    if (verificationData.code !== code) {

      return res.status(400).json({

        success: false,

        error: 'Invalid verification code'

      });

    }



    // Update user as verified

    await prisma.user.update({

      where: { id: verificationData.userId },

      data: { verified: true }

    });



    // Clean up verification code

    await prisma.verificationCode.delete({

      where: { email }

    });





    // Auto-login after verification

    const token = generateToken(verificationData.userId);

    const refreshToken = generateRefreshToken(verificationData.userId);



    const user = await prisma.user.findUnique({

      where: { id: verificationData.userId },

      select: { id: true, name: true, email: true, avatar: true, verified: true }

    });



    res.json({

      success: true,

      data: {

        user,

        token,

        refreshToken,

        message: 'Email verified successfully'

      }

    });

  } catch (error) {

    logger.error('Verification error:', error);

    res.status(500).json({

      success: false,

      error: 'Verification failed'

    });

  }

};



export const resendVerification = async (req: Request, res: Response) => {

  try {

    const { email } = req.body;



    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {

      return res.status(404).json({

        success: false,

        error: 'User not found'

      });

    }



    if (user.verified) {

      return res.status(400).json({

        success: false,

        error: 'User already verified'

      });

    }



    const verificationCode = generateVerificationCode();



    try {

      await sendVerificationEmail(email, verificationCode);

    } catch (emailError) {

      logger.error('Email sending failed:', emailError);

      return res.status(500).json({

        success: false,

        error: 'Failed to send verification email'

      });

    }



    // Store verification code in database
    await prisma.verificationCode.upsert({
      where: { email },
      update: {
        code: verificationCode,
        userId: user.id,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      },
      create: {
        email,
        code: verificationCode,
        userId: user.id,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      }
    });

    res.json({

      success: true,

      message: 'Verification code sent successfully'

    });

  } catch (error) {

    logger.error('Resend verification error:', error);

    res.status(500).json({

      success: false,

      error: 'Failed to resend verification code'

    });

  }

};



export const refreshToken = async (req: Request, res: Response) => {

  try {

    const { refreshToken } = req.body;



    if (!refreshToken) {

      return res.status(401).json({

        success: false,

        error: 'Refresh token required'

      });

    }



    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;

    const user = await prisma.user.findUnique({

      where: { id: decoded.id },

      select: { id: true, name: true, email: true, avatar: true, verified: true }

    });



    if (!user) {

      return res.status(401).json({

        success: false,

        error: 'Invalid refresh token'

      });

    }



    const newToken = generateToken(user.id);

    const newRefreshToken = generateRefreshToken(user.id);



    res.json({

      success: true,

      data: {

        token: newToken,

        refreshToken: newRefreshToken

      }

    });

  } catch (error) {

    res.status(401).json({

      success: false,

      error: 'Invalid refresh token'

    });

  }

};



export const logout = async (req: AuthRequest, res: Response) => {

  // In a production app, you might want to blacklist the token

  // For now, just return success

  res.json({

    success: true,

    message: 'Logged out successfully'

  });

};