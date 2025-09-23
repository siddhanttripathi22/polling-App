const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');   // ✅ Add path module
require('dotenv').config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// 👉 Serve React build (after npm run build)
app.use(express.static(path.join(__dirname, "frontend/dist")));

// In-memory storage
let currentPoll = null;
let students = new Map();
let teachers = new Set();
let pollHistory = [];

const POLL_TIME_LIMIT = 60; // seconds

// Helper functions (unchanged) ...
function getCurrentPollWithStats() { /* ... */ }
function calculateResults() { /* ... */ }
function endPoll() { /* ... */ }

// Socket.io logic (unchanged) ...
io.on('connection', (socket) => {
  // all your existing socket handlers stay as is
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

// 👉 Catch-all route for React Router
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/dist", "index.html"));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
  console.log(` Live Polling System Backend Started`);
  console.log(` Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
