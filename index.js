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
      origin: ["https://polling-app-ps3h.vercel.app"],
     
    ],
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage
let currentPoll = null;
let students = new Map();
let teachers = new Set();
let pollHistory = [];

const POLL_TIME_LIMIT = 60; // seconds

// Helper functions (unchanged)
// function getCurrentPollWithStats() { ... }
// function calculateResults() { ... }
// function endPoll() { ... }

// Socket.io logic (unchanged)
io.on('connection', (socket) => {
  console.log("✅ Socket connected:", socket.id);

  // all your existing socket handlers...
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// API route example
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
  console.log(`Health check: /health`);
});
