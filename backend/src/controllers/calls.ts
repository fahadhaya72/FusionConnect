import { Request, Response } from 'express';
import { protect, AuthRequest } from '../middleware/auth';
import prisma from '../config/database';

// Create a new call
export const createCall = async (req: AuthRequest, res: Response) => {
  try {
    const { receiverId, type, chatId } = req.body;
    const callerId = req.user?.id;

    if (!callerId || !receiverId || !type) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: callerId, receiverId, type'
      });
    }

    // Generate unique room ID for WebRTC
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const call = await prisma.call.create({
      data: {
        callerId,
        receiverId,
        type, // VOICE or VIDEO
        chatId: chatId || null,
        status: 'RINGING',
        roomId
      },
      include: {
        caller: {
          select: { id: true, name: true, avatar: true }
        },
        receiver: {
          select: { id: true, name: true, avatar: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: {
        ...call,
        roomId // Explicitly include roomId in response
      }
    });
  } catch (error) {
    console.error('Create call error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create call'
    });
  }
};

// Get call details
export const getCall = async (req: AuthRequest, res: Response) => {
  try {
    const { callId } = req.params;
    const userId = req.user?.id;

    const call = await prisma.call.findFirst({
      where: {
        id: callId,
        OR: [
          { callerId: userId },
          { receiverId: userId }
        ]
      },
      include: {
        caller: {
          select: { id: true, name: true, avatar: true }
        },
        receiver: {
          select: { id: true, name: true, avatar: true }
        }
      }
    });

    if (!call) {
      return res.status(404).json({
        success: false,
        error: 'Call not found'
      });
    }

    res.json({
      success: true,
      data: call
    });
  } catch (error) {
    console.error('Get call error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get call'
    });
  }
};

// Update call status
export const updateCallStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { callId } = req.params;
    const { status } = req.body;
    const userId = req.user?.id;

    const call = await prisma.call.findFirst({
      where: {
        id: callId,
        OR: [
          { callerId: userId },
          { receiverId: userId }
        ]
      }
    });

    if (!call) {
      return res.status(404).json({
        success: false,
        error: 'Call not found'
      });
    }

    const updatedCall = await prisma.call.update({
      where: { id: callId },
      data: {
        status,
        endTime: status === 'ENDED' ? new Date() : undefined
      }
    });

    res.json({
      success: true,
      data: updatedCall
    });
  } catch (error) {
    console.error('Update call status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update call status'
    });
  }
};

// Get user's call history
export const getUserCalls = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 20 } = req.query;

    const calls = await prisma.call.findMany({
      where: {
        OR: [
          { callerId: userId },
          { receiverId: userId }
        ]
      },
      include: {
        caller: {
          select: { id: true, name: true, avatar: true }
        },
        receiver: {
          select: { id: true, name: true, avatar: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const total = await prisma.call.count({
      where: {
        OR: [
          { callerId: userId },
          { receiverId: userId }
        ]
      }
    });

    res.json({
      success: true,
      data: calls,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get user calls error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get calls'
    });
  }
};

// End call
export const endCall = async (req: AuthRequest, res: Response) => {
  try {
    const { callId } = req.params;
    const userId = req.user?.id;

    const call = await prisma.call.findFirst({
      where: {
        id: callId,
        OR: [
          { callerId: userId },
          { receiverId: userId }
        ]
      }
    });

    if (!call) {
      return res.status(404).json({
        success: false,
        error: 'Call not found'
      });
    }

    const updatedCall = await prisma.call.update({
      where: { id: callId },
      data: {
        status: 'ENDED',
        endTime: new Date()
      }
    });

    res.json({
      success: true,
      data: updatedCall
    });
  } catch (error) {
    console.error('End call error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to end call'
    });
  }
};
