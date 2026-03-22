import express from 'express';
import { protect } from '../middleware/auth';
import prisma from '../config/database';

const router = express.Router();

// Get dashboard stats
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;

    // Get user's stats
    const [
      activeChatsCount,
      upcomingMeetingsCount,
      teamMembersCount,
      unreadMessagesCount
    ] = await Promise.all([
      // Count active chats (where user is participant)
      prisma.chatParticipant.count({
        where: {
          userId: userId,
          chat: {
            messages: {
              some: {
                createdAt: {
                  gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                }
              }
            }
          }
        }
      }),

      // Count upcoming meetings (where user is participant or organizer)
      prisma.meetingParticipant.count({
        where: {
          userId: userId,
          meeting: {
            startTime: {
              gte: new Date()
            },
            status: 'SCHEDULED'
          }
        }
      }),

      // Count team members (contacts + other users in chats)
      prisma.contact.count({
        where: {
          userId: userId,
          status: 'ACCEPTED'
        }
      }),

      // Count unread messages (simplified - in real app, track read status)
      prisma.message.count({
        where: {
          chat: {
            participants: {
              some: {
                userId: userId
              }
            }
          },
          senderId: {
            not: userId
          },
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      })
    ]);

    res.json({
      activeChats: activeChatsCount,
      upcomingMeetings: upcomingMeetingsCount,
      teamMembers: teamMembersCount,
      unreadMessages: unreadMessagesCount
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get recent activity
router.get('/activity', protect, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;

    // Get recent messages
    const recentMessages = await prisma.message.findMany({
      where: {
        chat: {
          participants: {
            some: {
              userId: userId
            }
          }
        },
        senderId: {
          not: userId
        }
      },
      include: {
        sender: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    // Get recent meetings
    const recentMeetings = await prisma.meeting.findMany({
      where: {
        OR: [
          { organizerId: userId },
          {
            participants: {
              some: {
                userId: userId
              }
            }
          }
        ],
        startTime: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      orderBy: {
        startTime: 'desc'
      },
      take: 3
    });

    // Get recent contacts
    const recentContacts = await prisma.contact.findMany({
      where: {
        OR: [
          { userId: userId },
          { contactId: userId }
        ]
      },
      include: {
        user: {
          select: {
            name: true
          }
        },
        contact: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 3
    });

    // Get recent posts
    const recentPosts = await prisma.post.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 3
    });

    // Combine and format activity
    const activity = [
      ...recentMessages.map((msg: any) => ({
        id: msg.id,
        type: 'message' as const,
        from: msg.sender.name,
        content: msg.content.substring(0, 100) + (msg.content.length > 100 ? '...' : ''),
        time: msg.createdAt.toISOString(),
        urgent: false
      })),
      ...recentMeetings.map((meeting: any) => ({
        id: meeting.id,
        type: 'meeting' as const,
        from: meeting.title,
        content: `Meeting scheduled for ${meeting.startTime.toLocaleString()}`,
        time: meeting.createdAt.toISOString(),
        urgent: meeting.startTime.getTime() - Date.now() < 2 * 60 * 60 * 1000 // Within 2 hours
      })),
      ...recentContacts.map((contact: any) => ({
        id: contact.id,
        type: 'contact' as const,
        from: contact.user?.name || contact.contact?.name,
        content: contact.status === 'ACCEPTED' ? 'Contact request accepted' : 'New contact request',
        time: contact.createdAt.toISOString(),
        urgent: false
      })),
      ...recentPosts.map((post: any) => ({
        id: post.id,
        type: 'post' as const,
        from: 'Team',
        content: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
        time: post.createdAt.toISOString(),
        urgent: false
      }))
    ];

    // Sort by time and limit to 10 items
    activity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    res.json(activity.slice(0, 10));

  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

// Get upcoming meetings
router.get('/meetings', protect, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;

    const meetings = await prisma.meeting.findMany({
      where: {
        OR: [
          { organizerId: userId },
          {
            participants: {
              some: {
                userId: userId
              }
            }
          }
        ],
        startTime: {
          gte: new Date()
        },
        status: 'SCHEDULED'
      },
      orderBy: {
        startTime: 'asc'
      },
      take: 5
    });

    const formattedMeetings = meetings.map((meeting: any) => ({
      id: meeting.id,
      title: meeting.title,
      startTime: meeting.startTime.toISOString(),
      type: meeting.title.toLowerCase().includes('standup') ? 'standup' :
            meeting.title.toLowerCase().includes('review') ? 'review' :
            meeting.title.toLowerCase().includes('planning') ? 'planning' : 'meeting'
    }));

    res.json(formattedMeetings);

  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ error: 'Failed to fetch meetings' });
  }
});

export default router;
