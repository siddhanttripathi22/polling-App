import React, { useState } from 'react';
import { GraduationCap, BookOpen, Users, ArrowRight, Sparkles, Zap, Target } from 'lucide-react';

const RoleSelection = ({ onRoleSelect }) => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  const handleRoleClick = (role) => {
    setSelectedRole(role);
    if (role === 'student') {
      setShowNameInput(true);
    } else {
      onRoleSelect(role);
    }
  };

  const handleStudentSubmit = (e) => {
    e.preventDefault();
    if (studentName.trim()) {
      onRoleSelect('student', studentName.trim());
    }
  };

  const handleBack = () => {
    setSelectedRole(null);
    setShowNameInput(false);
    setStudentName('');
  };

  if (showNameInput) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-4 -right-4 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 w-full max-w-md transform transition-all duration-500 hover:shadow-3xl relative z-10">
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mb-6 shadow-lg animate-bounce">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-3">
              Enter Your Name
            </h2>
            <p className="text-gray-600 text-lg">Join the interactive learning experience</p>
          </div>

          <form onSubmit={handleStudentSubmit} className="space-y-6">
            <div className="relative">
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-3">
                Your Name
              </label>
              <div className="relative group">
                <input
                  type="text"
                  id="name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 text-lg bg-gray-50/50 group-hover:bg-white"
                  required
                  autoFocus
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <Sparkles className="w-5 h-5 text-emerald-400 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            </div>

            <div className="flex space-x-4 pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-semibold text-lg hover:transform hover:scale-105"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!studentName.trim()}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-3 text-lg font-semibold shadow-lg hover:shadow-xl hover:transform hover:scale-105 disabled:hover:scale-100"
              >
                <span>Join Class</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-96 h-96 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-4 -right-4 w-96 h-96 bg-gradient-to-r from-indigo-300 to-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-gradient-to-r from-emerald-300 to-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000"></div>
        <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-gradient-to-r from-yellow-300 to-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-1000"></div>
      </div>

      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-10 w-full max-w-6xl transform transition-all duration-500 hover:shadow-3xl relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="mx-auto w-24 h-24 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-8 shadow-lg relative">
            <Users className="w-12 h-12 text-white" />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
            Live Polling System
          </h1>
          <p className="text-2xl text-gray-600 font-light">Choose your role to get started</p>
          <div className="flex items-center justify-center space-x-2 mt-4">
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse animation-delay-200"></div>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse animation-delay-400"></div>
          </div>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 gap-10 mb-12">
          {/* Teacher Card */}
          <div 
            onClick={() => handleRoleClick('teacher')}
            onMouseEnter={() => setHoveredCard('teacher')}
            onMouseLeave={() => setHoveredCard(null)}
            className="group cursor-pointer transform transition-all duration-500 hover:scale-105 hover:-rotate-1"
          >
            <div className="relative bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700 rounded-3xl p-10 text-white h-full flex flex-col items-center justify-center text-center shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden">
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 group-hover:skew-x-12 transition-transform duration-700"></div>
              </div>
              
              <div className="relative z-10">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-8 group-hover:bg-white/30 transition-all duration-500 group-hover:animate-pulse border border-white/30">
                  <GraduationCap className="w-12 h-12" />
                </div>
                <h3 className="text-3xl font-bold mb-6 group-hover:text-yellow-300 transition-colors duration-300">
                  I'm a Teacher
                </h3>
                <p className="text-indigo-100 mb-8 leading-relaxed text-lg group-hover:text-white transition-colors duration-300">
                  Create and manage polls, view live results, and engage with your students in real-time
                </p>
                <div className="space-y-3 text-sm text-indigo-100 group-hover:text-white transition-colors duration-300">
                  <div className="flex items-center justify-center space-x-2">
                    <Target className="w-4 h-4" />
                    <span>Create interactive polls</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Zap className="w-4 h-4" />
                    <span>View live responses</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>Manage students</span>
                  </div>
                </div>
                
                {hoveredCard === 'teacher' && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <ArrowRight className="w-6 h-6 text-yellow-300" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Student Card */}
          <div 
            onClick={() => handleRoleClick('student')}
            onMouseEnter={() => setHoveredCard('student')}
            onMouseLeave={() => setHoveredCard(null)}
            className="group cursor-pointer transform transition-all duration-500 hover:scale-105 hover:rotate-1"
          >
            <div className="relative bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 rounded-3xl p-10 text-white h-full flex flex-col items-center justify-center text-center shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden">
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-white/20 to-transparent transform skew-x-12 group-hover:-skew-x-12 transition-transform duration-700"></div>
              </div>
              
              <div className="relative z-10">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-8 group-hover:bg-white/30 transition-all duration-500 group-hover:animate-pulse border border-white/30">
                  <BookOpen className="w-12 h-12" />
                </div>
                <h3 className="text-3xl font-bold mb-6 group-hover:text-yellow-300 transition-colors duration-300">
                  I'm a Student
                </h3>
                <p className="text-emerald-100 mb-8 leading-relaxed text-lg group-hover:text-white transition-colors duration-300">
                  Join live polls, submit your answers, and see how your responses compare with classmates
                </p>
                <div className="space-y-3 text-sm text-emerald-100 group-hover:text-white transition-colors duration-300">
                  <div className="flex items-center justify-center space-x-2">
                    <Target className="w-4 h-4" />
                    <span>Answer poll questions</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Zap className="w-4 h-4" />
                    <span>View live results</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Interactive learning</span>
                  </div>
                </div>
                
                {hoveredCard === 'student' && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <ArrowRight className="w-6 h-6 text-yellow-300" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full shadow-inner">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="text-gray-600 font-medium">Real-time polling system for interactive classroom engagement</span>
            <Sparkles className="w-4 h-4 text-purple-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;