const PollingResult = ({ socket }) => {
  const [currentQuestion, setCurrentQuestion] = useState(null);

  useEffect(() => {
    const handleNewQuestion = (question) => {
      setCurrentQuestion(question);
    };

    socket.on("new-question", handleNewQuestion);
    return () => socket.off("new-question", handleNewQuestion);
  }, [socket]);

  if (!currentQuestion) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-blue-400/30 rounded-2xl p-8 mb-8">
        <div className="text-center text-gray-400">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Waiting for results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-blue-400/30 rounded-2xl p-8 mb-8 shadow-xl">
      <div className="flex items-center justify-center mb-6">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white">Live Results</h2>
      </div>
      
      <div className="space-y-4">
        {Object.entries(currentQuestion.optionsFrequency || {}).map(([option, count]) => {
          const percentage = parseInt(currentQuestion.results?.[option] || 0);
          return (
            <div key={option} className="space-y-2">
              <div className="flex justify-between items-center text-sm text-gray-300">
                <span className="font-medium">{option}</span>
                <span>{count} votes</span>
              </div>
              <ProgressBar 
                percentage={percentage} 
                label={option} 
                animated={percentage < 70}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};