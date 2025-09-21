import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  User, 
  BarChart3, 
  LogOut,
  AlertCircle,
  Timer
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StudentInterface = ({ socket, studentName, onRoleChange }) => {
  const [currentPoll, setCurrentPoll] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [pollResults, setPollResults] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (!socket) return;

    // Socket event listeners
    socket.on('studentJoined', (data) => {
      if (data.success) {
        console.log('Successfully joined as student');
      }
    });

    socket.on('newPoll', (poll) => {
      setCurrentPoll(poll);
      setHasAnswered(false);
      setSelectedAnswer('');
      setPollResults(null);
      setShowResults(false);
      setTimeLeft(poll.timeLimit);
    });

    socket.on('currentPoll', (poll) => {
      if (poll) {
        setCurrentPoll(poll);
        // Calculate remaining time
        const elapsed = Math.floor((Date.now() - new Date(poll.startTime).getTime()) / 1000);
        const remaining = Math.max(0, poll.timeLimit - elapsed);
        setTimeLeft(remaining);
      }
    });

    socket.on('answerSubmitted', (data) => {
      if (data.success) {
        setHasAnswered(true);
        setIsSubmitting(false);
      }
    });

    socket.on('pollResults', (results) => {
      setPollResults(results);
      setShowResults(true);
    });

    socket.on('pollEnded', (results) => {
      setPollResults(results);
      setCurrentPoll(null);
      setShowResults(true);
      setTimeLeft(0);
    });

    socket.on('removed', (data) => {
      alert(data.message);
      onRoleChange(null);
    });

    socket.on('error', (error) => {
      alert(error);
      setIsSubmitting(false);
    });

    return () => {
      socket.off('studentJoined');
      socket.off('newPoll');
      socket.off('currentPoll');
      socket.off('answerSubmitted');
      socket.off('pollResults');
      socket.off('pollEnded');
      socket.off('removed');
      socket.off('error');
    };
  }, [socket, onRoleChange]);

  // Timer countdown effect
  useEffect(() => {
    if (timeLeft > 0 && currentPoll && !hasAnswered) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, currentPoll, hasAnswered]);

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || isSubmitting) return;

    setIsSubmitting(true);
    socket.emit('submitAnswer', { answer: selectedAnswer });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeLeft > 30) return 'text-green-600';
    if (timeLeft > 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Transform results for chart
  const chartData = pollResults ? 
    Object.entries(pollResults.results).map(([option, count]) => ({
      option: option.length > 15 ? option.substring(0, 15) + '...' : option,
      count,
      fullOption: option
    })) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Welcome, {studentName}!</h1>
                <p className="text-gray-600">Student Polling Interface</p>
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

        {/* Main Content */}
        {currentPoll ? (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Timer and Status */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className={`flex items-center space-x-2 ${getTimeColor()}`}>
                  <Timer className="w-5 h-5" />
                  <span className="text-xl font-bold">{formatTime(timeLeft)}</span>
                </div>
                {timeLeft === 0 && (
                  <div className="flex items-center space-x-2 text-red-600">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">Time's up!</span>
                  </div>
                )}
              </div>
              
              {hasAnswered && (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Answer submitted!</span>
                </div>
              )}
            </div>

            {/* Question */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Poll Question</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-lg text-gray-700 leading-relaxed">{currentPoll.question}</p>
              </div>
            </div>

            {/* Answer Options */}
            {!hasAnswered && timeLeft > 0 ? (
              <div className="space-y-4 mb-8">
                <h3 className="text-lg font-semibold text-gray-800">Choose your answer:</h3>
                <div className="grid gap-3">
                  {currentPoll.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedAnswer(option)}
                      className={`flex items-center space-x-4 p-4 border-2 rounded-lg transition-all duration-200 ${
                        selectedAnswer === option
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-300 hover:border-green-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold ${
                        selectedAnswer === option
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-gray-400 text-gray-600'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="text-left font-medium text-gray-700">{option}</span>
                    </button>
                  ))}
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-4">
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!selectedAnswer || isSubmitting}
                    className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2 text-lg font-semibold"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        <span>Submit Answer</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                {hasAnswered ? (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">Answer Submitted!</h3>
                    <p className="text-gray-600">
                      You answered: <span className="font-semibold text-green-600">{selectedAnswer}</span>
                    </p>
                    <p className="text-sm text-gray-500">Waiting for other students to respond...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                      <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">Time's Up!</h3>
                    <p className="text-gray-600">The poll has ended. Waiting for results...</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : showResults ? (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Poll Results</h2>
              <p className="text-gray-600">Here's how everyone responded</p>
            </div>

            {/* Question Display */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Question:</h3>
              <p className="text-gray-700">{pollResults.question}</p>
            </div>

            {/* Results Chart */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Results Breakdown</h3>
              <div className="h-80 mb-6">
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
                    <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Results Summary */}
              <div className="grid gap-4">
                {Object.entries(pollResults.results).map(([option, count], index) => {
                  const percentage = pollResults.totalResponses > 0 ? 
                    Math.round((count / pollResults.totalResponses) * 100) : 0;
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold">
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="font-medium text-gray-700">{option}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-600 w-12">
                            {percentage}%
                          </span>
                        </div>
                        <span className="text-lg font-bold text-green-600 w-8 text-center">
                          {count}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Total Responses: {pollResults.totalResponses} out of {pollResults.totalStudents} students
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Waiting for Poll</h3>
            <p className="text-gray-600 mb-6">
              Your teacher hasn't started a poll yet. You'll see the question here when it's available.
            </p>
            <div className="bg-blue-50 rounded-lg p-6">
              <h4 className="font-semibold text-blue-800 mb-2">What happens next?</h4>
              <ul className="text-sm text-blue-700 space-y-1 text-left max-w-md mx-auto">
                <li>• Your teacher will create a poll question</li>
                <li>• You'll have a limited time to answer</li>
                <li>• Results will be shown after everyone responds</li>
                <li>• Stay on this page to participate!</li>
              </ul>
            </div>
          </div>
        )}

        {/* Connection Status */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white rounded-full shadow-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">Connected as {studentName}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentInterface;