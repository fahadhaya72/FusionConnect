import { Request, Response } from 'express';
import prisma from '../config/database';

interface AuthRequest extends Request {
  user?: any;
}

export const getChats = async (req: AuthRequest, res: Response) => {
  try {
    const chats = await prisma.chatParticipant.findMany({
      where: { userId: req.user.id },
      include: {
        chat: {
          include: {
            participants: {
              include: {
                user: {
                  select: { id: true, name: true, avatar: true }
                }
              }
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              include: {
                sender: {
                  select: { id: true, name: true }
                }
              }
            }
          }
        }
      },
      orderBy: { chat: { messages: { _count: 'desc' } } }
    });

    const formattedChats = chats.map(participant => {
      const chat = participant.chat;
      const otherParticipants = chat.participants.filter(p => p.userId !== req.user.id);
      const lastMessage = chat.messages[0];

      return {
        id: chat.id,
        name: chat.name || otherParticipants.map(p => p.user.name).join(', '),
        type: chat.type,
        participants: chat.participants.map(p => ({
          id: p.user.id,
          name: p.user.name,
          avatar: p.user.avatar
        })),
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          sender: lastMessage.sender.name,
          time: lastMessage.createdAt
        } : null,
        unreadCount: 0 // TODO: Implement unread count
      };
    });

    res.json({
      success: true,
      data: formattedChats
    });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get chats'
    });
  }
};

export const createChat = async (req: AuthRequest, res: Response) => {
  try {
    const { participantIds, name, type = 'DIRECT' } = req.body;

    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Participant IDs are required'
      });
    }

    // For direct chats, verify users are friends
    if (type === 'DIRECT' && participantIds.length === 1) {
      const otherUserId = participantIds[0];
      const friendContact = await prisma.contact.findFirst({
        where: {
          OR: [
            { userId: req.user.id, contactId: otherUserId, status: 'ACCEPTED' },
            { userId: otherUserId, contactId: req.user.id, status: 'ACCEPTED' }
          ]
        }
      });

      if (!friendContact) {
        return res.status(403).json({
          success: false,
          error: 'You can only message friends. Send a contact request first.'
        });
      }
    }

    // Add current user to participants
    const allParticipantIds = [...new Set([req.user.id, ...participantIds])];

    // For direct chats, check if chat already exists
    if (type === 'DIRECT' && allParticipantIds.length === 2) {
      const existingChat = await prisma.chat.findFirst({
        where: {
          type: 'DIRECT',
          participants: {
            every: {
              userId: { in: allParticipantIds }
            }
          }
        },
        include: {
          participants: {
            include: {
              user: {
                select: { id: true, name: true, avatar: true }
              }
            }
          }
        }
      });

      if (existingChat) {
        return res.json({
          success: true,
          data: existingChat
        });
      }
    }

    // Create new chat
    const chat = await prisma.chat.create({
      data: {
        name: type === 'GROUP' ? name : null,
        type,
        participants: {
          create: allParticipantIds.map(userId => ({
            userId
          }))
        }
      },
      include: {
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
      data: chat
    });
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create chat'
    });
  }
};

export const getChatMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { chatId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // Check if user is participant
    const participant = await prisma.chatParticipant.findUnique({
      where: {
        userId_chatId: {
          userId: req.user.id,
          chatId
        }
      }
    });

    if (!participant) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this chat'
      });
    }

    const messages = await prisma.message.findMany({
      where: { chatId },
      skip,
      take: limit,
      include: {
        sender: {
          select: { id: true, name: true, avatar: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.message.count({ where: { chatId } });

    res.json({
      success: true,
      data: {
        messages: messages.reverse(), // Return in chronological order
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get messages'
    });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { chatId } = req.params;
    const { content, type = 'TEXT' } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Message content is required'
      });
    }

    // Check if user is participant
    const participant = await prisma.chatParticipant.findUnique({
      where: {
        userId_chatId: {
          userId: req.user.id,
          chatId
        }
      }
    });

    if (!participant) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to send messages in this chat'
      });
    }

    const message = await prisma.message.create({
      data: {
        content,
        type,
        chatId,
        senderId: req.user.id
      },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message'
    });
  }
};