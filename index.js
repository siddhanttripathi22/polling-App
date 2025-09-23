// backend/index.js
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "https://polling-app-ps3h.vercel.app",
      "http://localhost:5173", 
      "http://localhost:3000"
    ],
    methods: ["GET", "POST"],
    credentials: true
  },
  // Add these Railway-specific configurations
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000
});

// Middleware
app.use(cors({
  origin: [
    "https://polling-app-ps3h.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000"
  ],
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json());

// In-memory storage
let currentPoll = null;
let students = new Map();
let teachers = new Set();
let pollHistory = [];
const POLL_TIME_LIMIT = 60; // seconds

// Helper functions
function getCurrentPollWithStats() {
  if (!currentPoll) return null;
  return {
    question: currentPoll.question,
    options: currentPoll.options,
    votes: currentPoll.votes
  };
}

// Socket.io events
io.on('connection', (socket) => {
  console.log("✅ Socket connected:", socket.id);
  
  socket.on('joinAsTeacher', () => {
    teachers.add(socket.id);
    console.log("Teacher joined:", socket.id);
    socket.emit('teacherJoined', { success: true });
  });
  
  socket.on('joinAsStudent', ({ name }) => {
    students.set(socket.id, name);
    console.log("Student joined:", name, socket.id);
    socket.emit('studentJoined', { success: true, name });
  });
  
  socket.on('disconnect', (reason) => {
    teachers.delete(socket.id);
    students.delete(socket.id);
    console.log("Socket disconnected:", socket.id, "Reason:", reason);
  });
  
  // Add ping/pong for connection health
  socket.on('ping', () => {
    socket.emit('pong');
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    uptime: process.uptime(),
    connections: io.engine.clientsCount
  });
});

// API endpoint
app.get('/api/poll/status', (req, res) => {
  res.json({
    currentPoll: getCurrentPollWithStats(),
    studentsCount: students.size,
    teachersCount: teachers.size
  });
});

// Catch all for undefined routes
app.get('*', (req, res) => {
  res.json({ message: 'Polling App Backend API', status: 'running' });
});

// Use Railway's provided PORT or fallback
const PORT = process.env.PORT || 3001;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO server ready for connections`);
});
