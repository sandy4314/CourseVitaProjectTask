require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);

// Socket.IO setup
// server.js - Updated Socket.IO configuration
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-socket-id"],
    credentials: true
  },
  transports: ['websocket', 'polling'] // Enable both transports
});

// Enhanced Socket.IO authentication middleware
// server.js - Socket.IO authentication with better error handling
io.use((socket, next) => {
  // Try multiple ways to get the token
  let token = socket.handshake.auth.token;
  
  if (!token) {
    token = socket.handshake.query.token;
  }
  
  if (!token) {
    console.log('Socket connection rejected: No token provided');
    const err = new Error('Authentication error: No token provided');
    err.data = { content: 'Please retry later' };
    return next(err);
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user exists and is active
    User.findById(decoded.id).then(user => {
      if (!user) {
        const err = new Error('Authentication error: User not found');
        err.data = { content: 'Please login again' };
        return next(err);
      }
      
      socket.userId = decoded.id;
      socket.username = decoded.username;
      socket.role = decoded.role;
      console.log('Socket authenticated for user:', decoded.username);
      next();
    }).catch(err => {
      console.log('Socket connection rejected: User lookup failed');
      next(new Error('Authentication error: User lookup failed'));
    });
    
  } catch (err) {
    console.log('Socket connection rejected: Invalid token');
    const error = new Error('Authentication error: Invalid token');
    error.data = { content: 'Please login again' };
    next(error);
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.username);
  
  // Add user to connected users map
  connectedUsers.set(socket.userId, {
    id: socket.userId,
    username: socket.username,
    socketId: socket.id
  });
  
  // Join user to their personal room for private messages
  socket.join(socket.userId);
  
  // Emit user list to all clients
  io.emit('userList', Array.from(connectedUsers.values()));
  
  // Handle joining chat rooms
  socket.on('joinRoom', (room) => {
    socket.join(room);
    console.log(`${socket.username} joined room: ${room}`);
    socket.to(room).emit('userJoined', {
      userId: socket.userId,
      username: socket.username,
      room: room
    });
  });
  
  // Handle leaving chat rooms
  socket.on('leaveRoom', (room) => {
    socket.leave(room);
    console.log(`${socket.username} left room: ${room}`);
    socket.to(room).emit('userLeft', {
      userId: socket.userId,
      username: socket.username,
      room: room
    });
  });
  
  // Handle typing indicators
  socket.on('typing', (data) => {
    socket.to(data.room).emit('userTyping', {
      userId: socket.userId,
      username: socket.username,
      isTyping: data.isTyping
    });
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.username);
    connectedUsers.delete(socket.userId);
    io.emit('userList', Array.from(connectedUsers.values()));
  });
});

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(cors({
  origin: ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Initialize admin user
    const User = require('./models/User');
    await User.initAdminUser();
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const taskRoutes = require('./routes/taskRoutes');
const chatRoutes = require('./routes/chatRoutes');
const forumRoutes = require('./routes/forumRoutes');
const githubRoutes = require('./routes/githubRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/github', githubRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    connectedUsers: connectedUsers.size
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});