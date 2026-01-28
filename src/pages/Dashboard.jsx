import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');
    
    if (!token || !userName) {
      localStorage.clear();
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Header title={`Welcome, ${localStorage.getItem('userName')}!`} />
      <div className="flex items-center justify-center p-8 min-h-[calc(100vh-64px)]">
        <div className="max-w-4xl w-full">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">Your AI Assistant</h1>
            <p className="text-gray-400 text-lg">Choose an option to get started</p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* New Chat Card */}
            <button
              onClick={() => navigate('/new-chat')}
              className="group relative bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm p-8 rounded-2xl border border-blue-500/30 hover:border-blue-500/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-blue-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-300">💬</div>
                <h2 className="text-3xl font-bold text-white mb-3">Start New Chat</h2>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">Begin a fresh conversation with AI</p>
              </div>
            </button>

            {/* My Chats Card */}
            <button
              onClick={() => navigate('/my-chats')}
              className="group relative bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-sm p-8 rounded-2xl border border-purple-500/30 hover:border-purple-500/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-purple-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-300">📚</div>
                <h2 className="text-3xl font-bold text-white mb-3">My Chats</h2>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">View your conversation history</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;