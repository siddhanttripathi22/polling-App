import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import io from 'socket.io-client';
import RoleSelection from './components/RoleSelection';
import TeacherDashboard from './components/TeacherDashboard';
import StudentInterface from './components/StudentInterface';
import './App.css';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

function App() {
  const [socket, setSocket] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Check if user has already selected a role in this session
    const savedRole = sessionStorage.getItem('userRole');
    const savedName = sessionStorage.getItem('studentName');
    
    if (savedRole) {
      setUserRole(savedRole);
      if (savedName) {
        setStudentName(savedName);
      }
    }
  }, []);

  useEffect(() => {
    if (userRole) {
      // Initialize socket connection
      const newSocket = io(SOCKET_URL, {
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
        setIsConnected(true);
        
        if (userRole === 'teacher') {
          newSocket.emit('joinAsTeacher');
        } else if (userRole === 'student' && studentName) {
          newSocket.emit('joinAsStudent', { name: studentName });
        }
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        setIsConnected(false);
      });

      newSocket.on('removed', (data) => {
        alert(data.message);
        handleRoleSelect(null);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [userRole, studentName]);

  const handleRoleSelect = (role, name = '') => {
    setUserRole(role);
    setStudentName(name);
    
    // Save to session storage
    if (role) {
      sessionStorage.setItem('userRole', role);
      if (name) {
        sessionStorage.setItem('studentName', name);
      }
    } else {
      sessionStorage.removeItem('userRole');
      sessionStorage.removeItem('studentName');
    }
  };

  if (!userRole) {
    return <RoleSelection onRoleSelect={handleRoleSelect} />;
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="text-lg font-medium text-gray-700">Connecting to server...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Routes>
          <Route 
            path="/" 
            element={
              userRole === 'teacher' ? (
                <TeacherDashboard socket={socket} onRoleChange={handleRoleSelect} />
              ) : (
                <StudentInterface 
                  socket={socket} 
                  studentName={studentName} 
                  onRoleChange={handleRoleSelect} 
                />
              )
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
