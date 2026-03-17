import { Request, Response } from 'express';
import prisma from '../config/database';

interface AuthRequest extends Request {
  user?: any;
}

export const getContacts = async (req: AuthRequest, res: Response) => {
  try {
    const contacts = await prisma.contact.findMany({
      where: {
        OR: [
          { userId: req.user.id, status: 'ACCEPTED' },
          { contactId: req.user.id, status: 'ACCEPTED' }
        ]
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true, bio: true }
        },
        contact: {
          select: { id: true, name: true, email: true, avatar: true, bio: true }
        }
      }
    });

    const formattedContacts = contacts.map(contact => {
      const isRequester = contact.userId === req.user.id;
      return {
        id: contact.id,
        user: isRequester ? contact.contact : contact.user,
        status: contact.status,
        createdAt: contact.createdAt
      };
    });

    // Also get pending requests
    const pendingRequests = await prisma.contact.findMany({
      where: {
        contactId: req.user.id,
        status: 'PENDING'
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true, bio: true }
        }
      }
    });

    res.json({
      success: true,
      data: {
        contacts: formattedContacts,
        pendingRequests: pendingRequests.map(req => ({
          id: req.id,
          user: req.user,
          createdAt: req.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get contacts'
    });
  }
};

export const sendContactRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { contactId } = req.body;

    if (!contactId) {
      return res.status(400).json({
        success: false,
        error: 'Contact ID is required'
      });
    }

    if (contactId === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot send request to yourself'
      });
    }

    // Check if contact exists
    const contactUser = await prisma.user.findUnique({
      where: { id: contactId }
    });

    if (!contactUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if request already exists
    const existingRequest = await prisma.contact.findFirst({
      where: {
        OR: [
          { userId: req.user.id, contactId },
          { userId: contactId, contactId: req.user.id }
        ]
      }
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        error: 'Contact request already exists'
      });
    }

    const contactRequest = await prisma.contact.create({
      data: {
        userId: req.user.id,
        contactId
      },
      include: {
        contact: {
          select: { id: true, name: true, avatar: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: contactRequest
    });
  } catch (error) {
    console.error('Send contact request error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send contact request'
    });
  }
};

export const acceptContactRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { requestId } = req.params;

    const request = await prisma.contact.findUnique({
      where: { id: requestId }
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Contact request not found'
      });
    }

    if (request.contactId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to accept this request'
      });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        error: 'Request already processed'
      });
    }

    const updatedRequest = await prisma.contact.update({
      where: { id: requestId },
      data: { status: 'ACCEPTED' },
      include: {
        user: {
          select: { id: true, name: true, avatar: true }
        }
      }
    });

    // Auto-create direct chat between the two friends
    try {
      // Check if a direct chat already exists
      let existingChat = await prisma.chat.findFirst({
        where: {
          type: 'DIRECT',
          participants: {
            every: {
              userId: {
                in: [request.userId, req.user.id]
              }
            }
          }
        }
      });

      if (!existingChat) {
        // Create new direct chat
        existingChat = await prisma.chat.create({
          data: {
            type: 'DIRECT',
            participants: {
              create: [
                { userId: request.userId },
                { userId: req.user.id }
              ]
            }
          }
        });
      }
    } catch (chatError) {
      // Log error but don't fail the request - friendship is more important than chat
      console.error('Failed to create chat for new friends:', chatError);
    }

    res.json({
      success: true,
      data: updatedRequest
    });
  } catch (error) {
    console.error('Accept contact request error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to accept contact request'
    });
  }
};

export const rejectContactRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { requestId } = req.params;

    const request = await prisma.contact.findUnique({
      where: { id: requestId }
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Contact request not found'
      });
    }

    if (request.contactId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to reject this request'
      });
    }

    await prisma.contact.delete({
      where: { id: requestId }
    });

    res.json({
      success: true,
      message: 'Contact request rejected'
    });
  } catch (error) {
    console.error('Reject contact request error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reject contact request'
    });
  }
};

export const removeContact = async (req: AuthRequest, res: Response) => {
  try {
    const { contactId } = req.params;

    const contact = await prisma.contact.findFirst({
      where: {
        OR: [
          { userId: req.user.id, contactId, status: 'ACCEPTED' },
          { userId: contactId, contactId: req.user.id, status: 'ACCEPTED' }
        ]
      }
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found'
      });
    }

    await prisma.contact.delete({
      where: { id: contact.id }
    });

    res.json({
      success: true,
      message: 'Contact removed successfully'
    });
  } catch (error) {
    console.error('Remove contact error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove contact'
    });
  }
};