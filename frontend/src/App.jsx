import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import RoleSelection from './components/RoleSelection';
import TeacherDashboard from './components/TeacherDashboard';
import StudentInterface from './components/StudentInterface';
import './App.css';

// Debug environment variables
console.log('🔍 All env vars:', import.meta.env);
console.log('🔍 VITE_SOCKET_URL:', import.meta.env.VITE_SOCKET_URL);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://polling-app-production-49f7.up.railway.app';

console.log('🌐 Using Socket URL:', SOCKET_URL);

function App() {
  const [socket, setSocket] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    const savedRole = sessionStorage.getItem('userRole');
    const savedName = sessionStorage.getItem('studentName');
    if (savedRole) {
      setUserRole(savedRole);
      if (savedName) setStudentName(savedName);
    }
  }, []);

  useEffect(() => {
    if (userRole && SOCKET_URL) {
      console.log('🔗 Attempting to connect to:', SOCKET_URL);
      console.log('👤 User role:', userRole);
      console.log('📝 Student name:', studentName);
      
      const newSocket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'], // Allow fallback to polling
        timeout: 20000,
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        maxReconnectionAttempts: 5,
        withCredentials: true
      });

      newSocket.on('connect', () => {
        console.log('✅ Connected to server:', newSocket.id);
        setIsConnected(true);
        setConnectionError(null);
        
        if (userRole === 'teacher') {
          newSocket.emit('joinAsTeacher');
        } else if (userRole === 'student' && studentName) {
          newSocket.emit('joinAsStudent', { name: studentName });
        }
      });

      newSocket.on('disconnect', (reason) => {
        console.log('❌ Disconnected from server. Reason:', reason);
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Connection error:', error);
        setIsConnected(false);
        setConnectionError(error.message);
      });

      newSocket.on('reconnect', (attemptNumber) => {
        console.log('🔄 Reconnected after', attemptNumber, 'attempts');
        setIsConnected(true);
        setConnectionError(null);
      });

      newSocket.on('reconnect_error', (error) => {
        console.error('🔄 Reconnection error:', error);
        setConnectionError(`Reconnection failed: ${error.message}`);
      });

      newSocket.on('removed', (data) => {
        alert(data.message);
        handleRoleSelect(null);
      });

      // Confirmation events
      newSocket.on('teacherJoined', () => {
        console.log('✅ Teacher role confirmed');
      });

      newSocket.on('studentJoined', (data) => {
        console.log('✅ Student role confirmed:', data.name);
      });

      setSocket(newSocket);

      return () => {
        console.log('🧹 Cleaning up socket connection');
        newSocket.close();
      };
    }
  }, [userRole, studentName, SOCKET_URL]);

  const handleRoleSelect = (role, name = '') => {
    setUserRole(role);
    setStudentName(name);
    setConnectionError(null);
    
    if (role) {
      sessionStorage.setItem('userRole', role);
      if (name) sessionStorage.setItem('studentName', name);
    } else {
      sessionStorage.removeItem('userRole');
      sessionStorage.removeItem('studentName');
    }
  };

  if (!userRole) return <RoleSelection onRoleSelect={handleRoleSelect} />;

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="text-lg font-medium text-gray-700">
              {connectionError ? 'Connection Failed' : 'Connecting to server...'}
            </span>
          </div>
          
          {connectionError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm mb-2">Connection Error:</p>
              <p className="text-red-600 text-xs font-mono">{connectionError}</p>
              <p className="text-red-500 text-xs mt-2">
                Server URL: {SOCKET_URL}
              </p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              >
                Retry Connection
              </button>
            </div>
          )}
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
