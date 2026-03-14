# FusionConnect Backend

A secure and scalable backend API for FusionConnect, built with Node.js, Express, TypeScript, and PostgreSQL.

## Features

- 🔐 **Authentication & Authorization**: JWT-based auth with refresh tokens
- 👥 **User Management**: Profile management and user search
- 💬 **Real-time Chat**: Socket.IO integration for instant messaging
- 📅 **Meeting Management**: Schedule and manage meetings
- 👥 **Contact System**: Send and manage contact requests
- 📱 **Posts & Media**: Create posts with image/video uploads
- 🛡️ **Security**: Helmet, CORS, rate limiting, input validation
- 📊 **Database**: PostgreSQL with Prisma ORM

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Real-time**: Socket.IO
- **Authentication**: JWT
- **File Upload**: Multer
- **Validation**: Joi
- **Security**: Helmet, CORS, bcryptjs

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- (Optional) PostgreSQL 13+ (recommended for production deployments)

### Installation

1. **Clone and navigate to backend:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up database (default: SQLite local file):**
   ```bash
   # (Optional) Update DATABASE_URL in .env to use PostgreSQL for production
   npm run migrate
   npm run generate
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

## Environment Variables

```env
# Database (default: SQLite local file)
DATABASE_URL="file:./dev.db"
# For PostgreSQL (production), use a URL like:
# DATABASE_URL="postgresql://username:password@localhost:5432/fusionconnect?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-refresh-token-secret"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Server
PORT=5000
NODE_ENV="development"

# CORS
FRONTEND_URL="http://localhost:3000"

# Email (for verification)
EMAIL_SERVICE="gmail"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# File Upload
UPLOAD_PATH="./uploads"
MAX_FILE_SIZE=5242880
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify` - Verify email with code
- `POST /api/auth/resend` - Resend verification code
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users` - Get all users (paginated)
- `GET /api/users/search` - Search users

### Posts
- `GET /api/posts` - Get all posts (paginated)
- `POST /api/posts` - Create new post
- `GET /api/posts/user/:userId` - Get user's posts
- `DELETE /api/posts/:id` - Delete post

### Chats
- `GET /api/chats` - Get user's chats
- `POST /api/chats` - Create new chat
- `GET /api/chats/:chatId/messages` - Get chat messages
- `POST /api/chats/:chatId/messages` - Send message

### Contacts
- `GET /api/contacts` - Get user's contacts
- `POST /api/contacts/request` - Send contact request
- `POST /api/contacts/accept/:requestId` - Accept request
- `POST /api/contacts/reject/:requestId` - Reject request
- `DELETE /api/contacts/:contactId` - Remove contact

### Meetings
- `GET /api/meetings` - Get user's meetings
- `POST /api/meetings` - Create new meeting
- `GET /api/meetings/:id` - Get meeting details
- `PUT /api/meetings/:id` - Update meeting
- `DELETE /api/meetings/:id` - Delete meeting

## Real-time Events (Socket.IO)

### Authentication
```javascript
const socket = io('http://localhost:5000', {
  auth: { token: 'your-jwt-token' }
});
```

### Chat Events
```javascript
// Join a chat
socket.emit('join_chat', chatId);

// Send message
socket.emit('send_message', { chatId, content, type });

// Listen for new messages
socket.on('new_message', (message) => {
  console.log('New message:', message);
});

// Typing indicators
socket.emit('typing_start', chatId);
socket.emit('typing_stop', chatId);
socket.on('user_typing', (data) => { ... });
```

## Database Schema

The application uses the following main entities:
- **Users**: User accounts with profiles
- **Chats**: Chat conversations (direct/group)
- **Messages**: Chat messages
- **Contacts**: Contact relationships
- **Meetings**: Scheduled meetings
- **Posts**: User posts with media

## Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcryptjs for password security
- **Rate Limiting**: Prevents abuse with request limits
- **Input Validation**: Joi schemas for all inputs
- **CORS**: Configured for frontend origin
- **Helmet**: Security headers
- **SQL Injection Protection**: Prisma ORM prevents SQL injection

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run migrate` - Run database migrations
- `npm run generate` - Generate Prisma client

### Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts
│   ├── controllers/
│   │   ├── auth.ts
│   │   ├── users.ts
│   │   ├── posts.ts
│   │   ├── chats.ts
│   │   ├── contacts.ts
│   │   └── meetings.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── errorHandler.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── users.ts
│   │   ├── posts.ts
│   │   ├── chats.ts
│   │   ├── contacts.ts
│   │   └── meetings.ts
│   ├── socket/
│   │   └── socket.ts
│   ├── utils/
│   │   ├── jwt.ts
│   │   ├── password.ts
│   │   └── email.ts
│   └── server.ts
├── prisma/
│   └── schema.prisma
├── uploads/
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

## Deployment

1. Set `NODE_ENV=production` in environment
2. Run `npm run build`
3. Use `npm start` to run the built application
4. Set up PostgreSQL database
5. Configure reverse proxy (nginx) for production
6. Set up SSL certificates
7. Configure environment variables

## Contributing

1. Follow the existing code style
2. Write tests for new features
3. Update documentation
4. Use TypeScript strictly
5. Follow REST API conventions

## License

MIT License