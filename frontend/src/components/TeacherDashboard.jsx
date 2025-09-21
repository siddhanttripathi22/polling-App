import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Users, 
  BarChart3, 
  Clock, 
  UserX, 
  History,
  LogOut,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TeacherDashboard = ({ socket, onRoleChange }) => {
  const [currentPoll, setCurrentPoll] = useState(null);
  const [students, setStudents] = useState([]);
  const [pollHistory, setPollHistory] = useState([]);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [pollResults, setPollResults] = useState(null);
  const [pollStats, setPollStats] = useState({ totalStudents: 0, answeredCount: 0, canAskNewQuestion: true });

  // Form states
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [timeLimit, setTimeLimit] = useState(60);

  useEffect(() => {
    if (!socket) return;

    // Socket event listeners
    socket.on('teacherJoined', (data) => {
      setCurrentPoll(data.currentPoll);
      setStudents(data.students);
      setPollHistory(data.history);
    });

    socket.on('currentPoll', (poll) => {
      setCurrentPoll(poll);
    });

    socket.on('studentJoined', (student) => {
      setStudents(prev => [...prev, student]);
    });

    socket.on('studentList', (studentList) => {
      setStudents(studentList);
    });

    socket.on('pollStats', (stats) => {
      setPollStats(stats);
    });

    socket.on('pollResults', (results) => {
      setPollResults(results);
    });

    socket.on('pollEnded', (results) => {
      setPollResults(results);
      setCurrentPoll(null);
    });

    socket.on('pollHistory', (history) => {
      setPollHistory(history);
    });

    socket.on('newPoll', (poll) => {
      setCurrentPoll(poll);
      setPollResults(null);
      setShowCreatePoll(false);
      resetForm();
    });

    socket.on('error', (error) => {
      alert(error);
    });

    return () => {
      socket.off('teacherJoined');
      socket.off('currentPoll');
      socket.off('studentJoined');
      socket.off('studentList');
      socket.off('pollStats');
      socket.off('pollResults');
      socket.off('pollEnded');
      socket.off('pollHistory');
      socket.off('newPoll');
      socket.off('error');
    };
  }, [socket]);

  const resetForm = () => {
    setQuestion('');
    setOptions(['', '']);
    setTimeLimit(60);
  };

  const handleCreatePoll = (e) => {
    e.preventDefault();
    
    const validOptions = options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      alert('Please provide at least 2 options');
      return;
    }

    socket.emit('createPoll', {
      question: question.trim(),
      options: validOptions,
      timeLimit
    });
  };

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const removeStudent = (studentId) => {
    if (confirm('Are you sure you want to remove this student?')) {
      socket.emit('removeStudent', studentId);
    }
  };

  const canCreateNewPoll = !currentPoll || pollStats.canAskNewQuestion;

  // Transform results for chart
  const chartData = pollResults ? 
    Object.entries(pollResults.results).map(([option, count]) => ({
      option: option.length > 15 ? option.substring(0, 15) + '...' : option,
      count,
      fullOption: option
    })) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Teacher Dashboard</h1>
                <p className="text-gray-600">Manage polls and view live results</p>
              </div>
            </div>
            <button
              onClick={() => onRoleChange(null)}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-red-600 transition-colors duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Switch Role</span>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Connected Students</p>
                    <p className="text-2xl font-bold text-blue-600">{students.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Responses</p>
                    <p className="text-2xl font-bold text-green-600">
                      {pollStats.answeredCount}/{pollStats.totalStudents}
                    </p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Poll History</p>
                    <p className="text-2xl font-bold text-purple-600">{pollHistory.length}</p>
                  </div>
                  <History className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Current Poll Section */}
            {currentPoll ? (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Active Poll</h2>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Time Limit: {currentPoll.timeLimit}s</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">{currentPoll.question}</h3>
                  <div className="grid gap-2">
                    {currentPoll.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                        <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="text-gray-700">{option}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    {pollStats.answeredCount} of {pollStats.totalStudents} students responded
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${pollStats.totalStudents > 0 ? (pollStats.answeredCount / pollStats.totalStudents) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {pollStats.totalStudents > 0 ? Math.round((pollStats.answeredCount / pollStats.totalStudents) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Active Poll</h3>
                <p className="text-gray-600 mb-6">Create a new poll to engage with your students</p>
                <button
                  onClick={() => setShowCreatePoll(true)}
                  disabled={!canCreateNewPoll}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Poll</span>
                </button>
              </div>
            )}

            {/* Results Section */}
            {pollResults && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Poll Results</h2>
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-700 mb-4">{pollResults.question}</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="option" 
                          tick={{ fontSize: 12 }}
                          interval={0}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis />
                        <Tooltip 
                          labelFormatter={(value, payload) => payload[0]?.payload?.fullOption || value}
                          formatter={(value) => [value, 'Responses']}
                        />
                        <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                      Total Responses: {pollResults.totalResponses} / {pollResults.totalStudents}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowCreatePoll(true)}
                  disabled={!canCreateNewPoll}
                  className="w-full flex items-center space-x-3 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Poll</span>
                </button>
                
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="w-full flex items-center justify-between p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <History className="w-4 h-4" />
                    <span>Poll History</span>
                  </div>
                  {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Connected Students */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Connected Students</h3>
                <span className="text-sm text-gray-500">{students.length} online</span>
              </div>
              
              {students.length === 0 ? (
                <div className="text-center py-6">
                  <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No students connected</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {students.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-gray-700 font-medium">{student.name}</span>
                      </div>
                      <button
                        onClick={() => removeStudent(student.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded transition-colors duration-200"
                        title="Remove student"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Poll History */}
            {showHistory && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Polls</h3>
                {pollHistory.length === 0 ? (
                  <div className="text-center py-6">
                    <History className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No polls created yet</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {pollHistory.slice().reverse().map((poll, index) => (
                      <div key={poll.id} className="p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-800 text-sm mb-1 truncate">
                          {poll.question}
                        </h4>
                        <div className="text-xs text-gray-500">
                          <p>{poll.totalResponses} responses</p>
                          <p>{new Date(poll.timestamp).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Poll Modal */}
      {showCreatePoll && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Create New Poll</h2>
                <button
                  onClick={() => {
                    setShowCreatePoll(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreatePoll} className="space-y-6">
                <div>
                  <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
                    Poll Question
                  </label>
                  <textarea
                    id="question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Enter your poll question here..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows="3"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Answer Options
                  </label>
                  <div className="space-y-3">
                    {options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                          {String.fromCharCode(65 + index)}
                        </div>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                        {options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {options.length < 6 && (
                    <button
                      type="button"
                      onClick={addOption}
                      className="mt-3 flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Option</span>
                    </button>
                  )}
                </div>

                <div>
                  <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700 mb-2">
                    Time Limit (seconds)
                  </label>
                  <input
                    type="number"
                    id="timeLimit"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                    min="10"
                    max="300"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreatePoll(false);
                      resetForm();
                    }}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <span>Create Poll</span>
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;