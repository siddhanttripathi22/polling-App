import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

// Mock socket for demo purposes
const createMockSocket = () => {
  const listeners = new Map();
  let currentQuestion = null;
  let questionTimer = null;
  
  const mockSocket = {
    id: Math.random().toString(36).substr(2, 9),
    
    on: (event, callback) => {
      if (!listeners.has(event)) {
        listeners.set(event, []);
      }
      listeners.get(event).push(callback);
    },
    
    off: (event, callback) => {
      if (listeners.has(event)) {
        const callbacks = listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    },
    
    emit: (event, data) => {
      // Mock server responses
      if (event === 'teacher-ask-question') {
        const question = {
          question: data.question,
          options: data.options,
          optionsFrequency: data.options.reduce((acc, opt) => ({ ...acc, [opt]: 0 }), {}),
          answered: false,
          results: {},
          timer: data.timer
        };
        
        currentQuestion = question;
        
        // Notify all listeners
        listeners.get('new-question')?.forEach(cb => cb(question));
        
        // Auto-close question after timer
        if (questionTimer) clearTimeout(questionTimer);
        questionTimer = setTimeout(() => {
          if (currentQuestion) {
            const total = Object.values(currentQuestion.optionsFrequency).reduce((sum, count) => sum + count, 0) || 1;
            Object.keys(currentQuestion.optionsFrequency).forEach(option => {
              currentQuestion.results[option] = Math.round((currentQuestion.optionsFrequency[option] / total) * 100);
            });
            currentQuestion.answered = true;
            listeners.get('new-question')?.forEach(cb => cb(currentQuestion));
          }
        }, data.timer * 1000);
      }
      
      if (event === 'handle-polling' && currentQuestion && !currentQuestion.answered) {
        currentQuestion.optionsFrequency[data.option] = (currentQuestion.optionsFrequency[data.option] || 0) + 1;
        
        const total = Object.values(currentQuestion.optionsFrequency).reduce((sum, count) => sum + count, 0);
        Object.keys(currentQuestion.optionsFrequency).forEach(option => {
          currentQuestion.results[option] = Math.round((currentQuestion.optionsFrequency[option] / total) * 100);
        });
        
        listeners.get('student-vote-validation')?.forEach(cb => cb([{ socketId: mockSocket.id, voted: true }]));
        listeners.get('new-question')?.forEach(cb => cb(currentQuestion));
      }
      
      if (event === 'student-set-name') {
        listeners.get('student-vote-validation')?.forEach(cb => cb([{ socketId: mockSocket.id, voted: false }]));
      }
    }
  };
  
  return mockSocket;
};

// Utility function for progress bar variants
const getVariant = (percentage) => {
  if (percentage <= 30) return 'bg-red-500';
  if (percentage <= 50) return 'bg-yellow-500';
  if (percentage <= 70) return 'bg-blue-500';
  return 'bg-green-500';
};

// Enhanced Progress Bar Component
const ProgressBar = ({ percentage, label, animated = false }) => {
  const variant = getVariant(percentage);
  
  return (
    <div className="w-full bg-gray-700 rounded-lg h-12 overflow-hidden shadow-inner">
      <div 
        className={`h-full ${variant} transition-all duration-500 ease-out flex items-center justify-center relative ${animated ? 'animate-pulse' : ''}`}
        style={{ width: `${Math.max(percentage, 5)}%` }}
      >
        <span className="text-white font-semibold text-sm px-2 truncate">
          {label} - {percentage}%
        </span>
      </div>
    </div>
  );
};
