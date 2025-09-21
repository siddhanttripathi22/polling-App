const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"]
  }
});


function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage
let currentPoll = null;
let students = new Map(); // socketId -> student data
let teachers = new Set(); // socketIds of teachers
let pollHistory = []; // Store past polls

const POLL_TIME_LIMIT = 60; // seconds

// Helper functions
function getCurrentPollWithStats() {
  if (!currentPoll) return null;
  
  const totalStudents = students.size;
  const answeredCount = Object.values(currentPoll.responses).length;
  
  return {
    ...currentPoll,
    stats: {
      totalStudents,
      answeredCount,
      canAskNewQuestion: answeredCount === totalStudents && totalStudents > 0
    }
  };
}

function calculateResults() {
  if (!currentPoll) return null;
  
  const results = {};
  currentPoll.options.forEach(option => {
    results[option] = 0;
  });
  
  Object.values(currentPoll.responses).forEach(response => {
    if (results.hasOwnProperty(response)) {
      results[response]++;
    }
  });
  
  return {
    question: currentPoll.question,
    results,
    totalResponses: Object.keys(currentPoll.responses).length,
    totalStudents: students.size
  };
}

function endPoll() {
  if (currentPoll) {
    const results = calculateResults();
    
    // Store in history
    pollHistory.push({
      id: currentPoll.id,
      question: currentPoll.question,
      options: currentPoll.options,
      results: results.results,
      totalResponses: results.totalResponses,
      timestamp: new Date(),
      endReason: 'timeout'
    });
    
    // Emit results to everyone
    io.emit('pollResults', results);
    io.emit('pollEnded', results);
    
    currentPoll = null;
  }
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Send current poll state to new connection
  const pollData = getCurrentPollWithStats();
  if (pollData) {
    socket.emit('currentPoll', pollData);
  }
  
  // Send student list to teachers
  socket.emit('studentList', Array.from(students.values()));
  socket.emit('pollHistory', pollHistory);
  
  // Handle teacher join
  socket.on('joinAsTeacher', () => {
    teachers.add(socket.id);
    console.log('Teacher joined:', socket.id);
    
    // Send current state
    socket.emit('teacherJoined', {
      currentPoll: getCurrentPollWithStats(),
      students: Array.from(students.values()),
      history: pollHistory
    });
  });
  
  // Handle student join
  socket.on('joinAsStudent', (studentData) => {
    students.set(socket.id, {
      id: socket.id,
      name: studentData.name,
      joinTime: new Date()
    });
    
    console.log('Student joined:', studentData.name);
    
    // Notify teachers about new student
    teachers.forEach(teacherId => {
      io.to(teacherId).emit('studentJoined', {
        id: socket.id,
        name: studentData.name
      });
    });
    
    // Send updated student list to all teachers
    teachers.forEach(teacherId => {
      io.to(teacherId).emit('studentList', Array.from(students.values()));
    });
    
    socket.emit('studentJoined', { success: true });
  });
  
  // Handle create poll
  socket.on('createPoll', (pollData) => {
    if (!teachers.has(socket.id)) {
      socket.emit('error', 'Only teachers can create polls');
      return;
    }
    
    // Check if can create new poll
    const canCreate = !currentPoll || 
      (currentPoll && Object.keys(currentPoll.responses).length === students.size);
    
    if (!canCreate) {
      socket.emit('error', 'Cannot create poll while students are still answering');
      return;
    }
    
    currentPoll = {
      id: generateUUID(),
      question: pollData.question,
      options: pollData.options,
      responses: {},
      startTime: new Date(),
      timeLimit: pollData.timeLimit || POLL_TIME_LIMIT,
      createdBy: socket.id
    };
    
    // Broadcast new poll to all connected clients
    io.emit('newPoll', getCurrentPollWithStats());
    
    // Set timeout for auto-ending poll
    setTimeout(() => {
      if (currentPoll && currentPoll.id === currentPoll.id) {
        endPoll();
      }
    }, (pollData.timeLimit || POLL_TIME_LIMIT) * 1000);
    
    console.log('Poll created:', currentPoll.question);
  });
  
  // Handle submit answer
  socket.on('submitAnswer', (answerData) => {
    const student = students.get(socket.id);
    if (!student) {
      socket.emit('error', 'Student not found');
      return;
    }
    
    if (!currentPoll) {
      socket.emit('error', 'No active poll');
      return;
    }
    
    if (currentPoll.responses[socket.id]) {
      socket.emit('error', 'You have already answered this poll');
      return;
    }
    
    // Record the answer
    currentPoll.responses[socket.id] = answerData.answer;
    
    console.log(`Student ${student.name} answered: ${answerData.answer}`);
    
    // Notify student that answer was recorded
    socket.emit('answerSubmitted', { success: true });
    
    // Check if all students have answered
    const totalStudents = students.size;
    const answeredCount = Object.keys(currentPoll.responses).length;
    
    // Send updated stats to teachers
    teachers.forEach(teacherId => {
      io.to(teacherId).emit('pollStats', {
        totalStudents,
        answeredCount,
        canAskNewQuestion: answeredCount === totalStudents
      });
    });
    
    // If everyone answered, show results immediately
    if (answeredCount === totalStudents) {
      const results = calculateResults();
      
      // Store in history
      pollHistory.push({
        id: currentPoll.id,
        question: currentPoll.question,
        options: currentPoll.options,
        results: results.results,
        totalResponses: results.totalResponses,
        timestamp: new Date(),
        endReason: 'all_answered'
      });
      
      io.emit('pollResults', results);
      io.emit('pollEnded', results);
      
      // Notify teachers of updated history
      teachers.forEach(teacherId => {
        io.to(teacherId).emit('pollHistory', pollHistory);
      });
      
      currentPoll = null;
    }
  });
  
  // Handle remove student (teacher only)
  socket.on('removeStudent', (studentId) => {
    if (!teachers.has(socket.id)) {
      socket.emit('error', 'Only teachers can remove students');
      return;
    }
    
    const student = students.get(studentId);
    if (student) {
      students.delete(studentId);
      io.to(studentId).emit('removed', { message: 'You have been removed by the teacher' });
      io.to(studentId).disconnect();
      
      // Update student list for all teachers
      teachers.forEach(teacherId => {
        io.to(teacherId).emit('studentList', Array.from(students.values()));
      });
      
      console.log(`Teacher removed student: ${student.name}`);
    }
  });
  
  // Handle get results
  socket.on('getResults', () => {
    if (currentPoll) {
      const results = calculateResults();
      socket.emit('pollResults', results);
    }
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove from teachers if teacher
    if (teachers.has(socket.id)) {
      teachers.delete(socket.id);
      console.log('Teacher disconnected');
    }
    
    // Remove from students if student
    const student = students.get(socket.id);
    if (student) {
      students.delete(socket.id);
      console.log('Student disconnected:', student.name);
      
      // Update student list for teachers
      teachers.forEach(teacherId => {
        io.to(teacherId).emit('studentList', Array.from(students.values()));
      });
      
      // Remove student's response from current poll if exists
      if (currentPoll && currentPoll.responses[socket.id]) {
        delete currentPoll.responses[socket.id];
      }
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Get current poll status
app.get('/api/poll/status', (req, res) => {
  res.json({
    currentPoll: getCurrentPollWithStats(),
    studentsCount: students.size,
    teachersCount: teachers.size
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
  console.log(` Live Polling System Backend Started`);
  console.log(` Health check: http://localhost:${PORT}/health`);
});

module.exports = app;