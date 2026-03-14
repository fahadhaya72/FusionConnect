import { Request, Response } from 'express';
import prisma from '../config/database';
import path from 'path';

interface AuthRequest extends Request {
  user?: any;
}

export const getPosts = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Get all users who are friends with current user
    const friendContacts = await prisma.contact.findMany({
      where: {
        AND: {
          OR: [
            { userId: req.user.id, status: 'ACCEPTED' },
            { contactId: req.user.id, status: 'ACCEPTED' }
          ]
        }
      },
      select: {
        userId: true,
        contactId: true
      }
    });

    // Extract friend IDs (handle both directions)
    const friendIds = new Set<string>();
    friendContacts.forEach(contact => {
      if (contact.userId === req.user.id) {
        friendIds.add(contact.contactId);
      } else {
        friendIds.add(contact.userId);
      }
    });

    // Add own ID to see own posts
    friendIds.add(req.user.id);

    const posts = await prisma.post.findMany({
      where: {
        userId: {
          in: Array.from(friendIds)
        }
      },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.post.count({
      where: {
        userId: {
          in: Array.from(friendIds)
        }
      }
    });

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get posts'
    });
  }
};

export const createPost = async (req: AuthRequest, res: Response) => {
  try {
    const { content } = req.body;
    const file = req.file;

    if (!content && !file) {
      return res.status(400).json({
        success: false,
        error: 'Content or media is required'
      });
    }

    let mediaUrl: string | undefined;
    let mediaType: 'IMAGE' | 'VIDEO' | undefined;

    if (file) {
      mediaUrl = `/uploads/${file.filename}`;
      mediaType = file.mimetype.startsWith('image/') ? 'IMAGE' : 'VIDEO';
    }

    const post = await prisma.post.create({
      data: {
        content: content || '',
        mediaUrl,
        mediaType,
        userId: req.user.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create post'
    });
  }
};

export const getUserPosts = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const posts = await prisma.post.findMany({
      where: { userId },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.post.count({ where: { userId } });

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user posts'
    });
  }
};

export const deletePost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id }
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    if (post.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this post'
      });
    }

    await prisma.post.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete post'
    });
  }
};