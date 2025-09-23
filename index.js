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
    origin: "https://polling-app-ps3h-siddhanttripathi22s-projects.vercel.app/", 
  }
});

// Middleware
app.use(cors({
  origin: "https://polling-app-ps3h.vercel.app",
  methods: ["GET", "POST"]
}));
app.use(express.json());

// In-memory storage
let currentPoll = null;
let students = new Map();
let teachers = new Set();
let pollHistory = [];

const POLL_TIME_LIMIT = 60; // seconds

// Helper functions (example)
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
  });

  socket.on('joinAsStudent', ({ name }) => {
    students.set(socket.id, name);
    console.log("Student joined:", name, socket.id);
  });

  socket.on('disconnect', () => {
    teachers.delete(socket.id);
    students.delete(socket.id);
    console.log("Socket disconnected:", socket.id);
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Example API
app.get('/api/poll/status', (req, res) => {
  res.json({
    currentPoll: getCurrentPollWithStats(),
    studentsCount: students.size,
    teachersCount: teachers.size
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
