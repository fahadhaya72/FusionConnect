import { Request, Response } from 'express';
import prisma from '../config/database';

interface AuthRequest extends Request {
  user?: any;
}

export const getMeetings = async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();

    const meetings = await prisma.meeting.findMany({
      where: {
        OR: [
          { organizerId: req.user.id },
          {
            participants: {
              some: {
                userId: req.user.id,
                status: 'ACCEPTED'
              }
            }
          }
        ]
      },
      include: {
        organizer: {
          select: { id: true, name: true, avatar: true }
        },
        participants: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true }
            }
          }
        },
        _count: {
          select: { participants: true }
        }
      },
      orderBy: { startTime: 'asc' }
    });

    const upcoming = meetings.filter(m => m.startTime > now);
    const past = meetings.filter(m => m.startTime <= now);

    res.json({
      success: true,
      data: {
        upcoming,
        past
      }
    });
  } catch (error) {
    console.error('Get meetings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get meetings'
    });
  }
};

export const createMeeting = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, startTime, endTime, participantIds } = req.body;

    // Verify all participants are friends
    if (participantIds && Array.isArray(participantIds)) {
      for (const participantId of participantIds) {
        const friendship = await prisma.contact.findFirst({
          where: {
            OR: [
              { userId: req.user.id, contactId: participantId, status: 'ACCEPTED' },
              { userId: participantId, contactId: req.user.id, status: 'ACCEPTED' }
            ]
          }
        });

        if (!friendship) {
          return res.status(403).json({
            success: false,
            error: `Cannot invite ${participantId}. You must be friends first.`
          });
        }
      }
    }

    if (!title || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        error: 'Title, start time, and end time are required'
      });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return res.status(400).json({
        success: false,
        error: 'End time must be after start time'
      });
    }

    const meeting = await prisma.meeting.create({
      data: {
        title,
        description,
        startTime: start,
        endTime: end,
        organizerId: req.user.id,
        participants: {
          create: participantIds ? participantIds.map((userId: string) => ({
            userId,
            status: userId === req.user.id ? 'ACCEPTED' : 'PENDING'
          })) : []
        }
      },
      include: {
        organizer: {
          select: { id: true, name: true, avatar: true }
        },
        participants: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true }
            }
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: meeting
    });
  } catch (error) {
    console.error('Create meeting error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create meeting'
    });
  }
};

export const getMeetingDetails = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: {
        organizer: {
          select: { id: true, name: true, email: true, avatar: true }
        },
        participants: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true }
            }
          }
        }
      }
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        error: 'Meeting not found'
      });
    }

    // Check if user has access
    const isOrganizer = meeting.organizerId === req.user.id;
    const isParticipant = meeting.participants.some(p => p.userId === req.user.id);

    if (!isOrganizer && !isParticipant) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this meeting'
      });
    }

    res.json({
      success: true,
      data: meeting
    });
  } catch (error) {
    console.error('Get meeting details error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get meeting details'
    });
  }
};

export const updateMeeting = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, startTime, endTime, status } = req.body;

    const meeting = await prisma.meeting.findUnique({
      where: { id }
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        error: 'Meeting not found'
      });
    }

    if (meeting.organizerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this meeting'
      });
    }

    const updateData: any = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (startTime) updateData.startTime = new Date(startTime);
    if (endTime) updateData.endTime = new Date(endTime);
    if (status) updateData.status = status;

    const updatedMeeting = await prisma.meeting.update({
      where: { id },
      data: updateData,
      include: {
        organizer: {
          select: { id: true, name: true, avatar: true }
        },
        participants: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      data: updatedMeeting
    });
  } catch (error) {
    console.error('Update meeting error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update meeting'
    });
  }
};

export const deleteMeeting = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const meeting = await prisma.meeting.findUnique({
      where: { id }
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        error: 'Meeting not found'
      });
    }

    if (meeting.organizerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this meeting'
      });
    }

    await prisma.meeting.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Meeting deleted successfully'
    });
  } catch (error) {
    console.error('Delete meeting error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete meeting'
    });
  }
};