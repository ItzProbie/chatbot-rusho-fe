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
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-600">
      <Header title={`Welcome, ${localStorage.getItem('userName')}!`} />
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-64px)]">
        <div className="max-w-2xl w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => navigate('/new-chat')}
              className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition transform hover:scale-105"
            >
              <div className="text-4xl mb-4">💬</div>
              <h2 className="text-2xl font-bold mb-2">Start New Chat</h2>
              <p className="text-gray-600">Begin a fresh conversation</p>
            </button>
            <button
              onClick={() => navigate('/my-chats')}
              className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition transform hover:scale-105"
            >
              <div className="text-4xl mb-4">📚</div>
              <h2 className="text-2xl font-bold mb-2">My Chats</h2>
              <p className="text-gray-600">View existing conversations</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;