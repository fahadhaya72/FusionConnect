import { Server, Socket } from 'socket.io';

import jwt from 'jsonwebtoken';

import prisma from '../config/database';



interface AuthenticatedSocket extends Socket {

  userId?: string;

}



export const initializeSocket = (io: Server) => {

  // Middleware for authentication

  io.use(async (socket: AuthenticatedSocket, next) => {

    try {

      const token = socket.handshake.auth.token;



      if (!token) {

        return next(new Error('Authentication token required'));

      }



      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

      const user = await prisma.user.findUnique({

        where: { id: decoded.id },

        select: { id: true }

      });



      if (!user) {

        return next(new Error('User not found'));

      }



      socket.userId = user.id;

      next();

    } catch (error) {

      next(new Error('Authentication failed'));

    }

  });



  io.on('connection', (socket: AuthenticatedSocket) => {

    console.log(`User ${socket.userId} connected`);



    // Join user's personal room for notifications

    socket.join(`user_${socket.userId}`);



    // Handle joining chat rooms

    socket.on('join_chat', async (chatId: string) => {

      try {

        // Verify user is participant in chat

        const participant = await prisma.chatParticipant.findUnique({

          where: {

            userId_chatId: {

              userId: socket.userId!,

              chatId

            }

          }

        });



        if (participant) {

          socket.join(`chat_${chatId}`);

          console.log(`User ${socket.userId} joined chat ${chatId}`);

        }

      } catch (error) {

        socket.emit('error', 'Failed to join chat');

      }

    });



    // Handle leaving chat rooms

    socket.on('leave_chat', (chatId: string) => {

      socket.leave(`chat_${chatId}`);

      console.log(`User ${socket.userId} left chat ${chatId}`);

    });



    // Handle sending messages

    socket.on('send_message', async (data: { chatId: string; content: string; type?: string }) => {

      try {

        const { chatId, content, type = 'TEXT' } = data;



        // Verify user is participant

        const participant = await prisma.chatParticipant.findUnique({

          where: {

            userId_chatId: {

              userId: socket.userId!,

              chatId

            }

          }

        });



        if (!participant) {

          socket.emit('error', 'Not authorized to send messages in this chat');

          return;

        }



        // Create message

        const message = await prisma.message.create({

          data: {

            content,

            type,

            chatId,

            senderId: socket.userId!

          },

          include: {

            sender: {

              select: { id: true, name: true, avatar: true }

            }

          }

        });



        // Emit to all participants in the chat

        io.to(`chat_${chatId}`).emit('new_message', message);



        // Also emit to sender's personal room for consistency

        socket.emit('message_sent', message);



      } catch (error) {

        console.error('Send message error:', error);

        socket.emit('error', 'Failed to send message');

      }

    });



    // Handle initiating voice/video calls

    socket.on('initiate_call', async (data: { recipientId: string; type: 'VOICE' | 'VIDEO' }) => {

      try {

        const { recipientId, type } = data;



        // Verify friendship

        const friendship = await prisma.contact.findFirst({

          where: {

            OR: [

              { userId: socket.userId!, contactId: recipientId, status: 'ACCEPTED' },

              { userId: recipientId, contactId: socket.userId!, status: 'ACCEPTED' }

            ]

          }

        });



        if (!friendship) {

          socket.emit('error', 'You can only call friends. Send a contact request first.');

          return;

        }



        // Emit call initiation to recipient

        io.to(`user_${recipientId}`).emit('incoming_call', {

          callerId: socket.userId,

          type,

          timestamp: new Date()

        });



        console.log(`Call initiated: ${socket.userId} -> ${recipientId} (${type})`);

      } catch (error) {

        console.error('Call initiation error:', error);

        socket.emit('error', 'Failed to initiate call');

      }

    });



    // Handle call acceptance

    socket.on('accept_call', (data: { callerId: string }) => {

      io.to(`user_${data.callerId}`).emit('call_accepted', {

        recipientId: socket.userId,

        timestamp: new Date()

      });

    });



    // Handle call rejection

    socket.on('reject_call', (data: { callerId: string }) => {

      io.to(`user_${data.callerId}`).emit('call_rejected', {

        recipientId: socket.userId,

        timestamp: new Date()

      });

    });



    // Handle call disconnection

    socket.on('end_call', (data: { otherUserId: string }) => {

      io.to(`user_${data.otherUserId}`).emit('call_ended', {

        userId: socket.userId,

        timestamp: new Date()

      });

    });



    // Handle typing indicators

    socket.on('typing_start', (chatId: string) => {

      socket.to(`chat_${chatId}`).emit('user_typing', {

        userId: socket.userId,

        chatId

      });

    });



    socket.on('typing_stop', (chatId: string) => {

      socket.to(`chat_${chatId}`).emit('user_stopped_typing', {

        userId: socket.userId,

        chatId

      });

    });



    // Handle disconnect

    socket.on('disconnect', () => {

      console.log(`User ${socket.userId} disconnected`);

    });

  });

};