import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMySessions, deleteSession } from '../api';
import Header from '../components/Header';
import toast from 'react-hot-toast';

const Mychats = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');
    
    if (!token || !userName) {
      localStorage.clear();
      navigate('/');
      return;
    }

    fetchSessions();
  }, [navigate]);

  // const handleDelete = async (sessionId, e) => {
  //   e.stopPropagation();
  //   if (!window.confirm('Delete this chat?')) return;
    
  //   try {
  //     await deleteSession(sessionId);
  //     setSessions(sessions.filter(s => s._id !== sessionId));
  //     if (localStorage.getItem('currentSessionId') === sessionId) {
  //       localStorage.removeItem('currentSessionId');
  //     }
  //   } catch (error) {
  //     toast.error('Failed to delete session');
  //   }
  // };

  const handleDelete = (sessionId, e) => {
    e.stopPropagation();

    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-black font-medium">
          Delete this chat?
        </p>

        <div className="flex justify-end gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await deleteSession(sessionId);
                setSessions(prev =>
                  prev.filter(s => s._id !== sessionId)
                );

                if (localStorage.getItem('currentSessionId') === sessionId) {
                  localStorage.removeItem('currentSessionId');
                }

                toast.success('Chat deleted');
              } catch {
                toast.error('Failed to delete session');
              }
            }}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
          >
            Delete
          </button>

          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: 7000,
    });
  };

  const fetchSessions = async () => {
    try {
      const response = await getMySessions();
      setSessions(response.data.sessions);
    } catch (error) {
      toast.error('Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Header title="My Chats" showBack={true} />
      <div className="max-w-5xl mx-auto p-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Conversation History</h1>
          <p className="text-gray-400">Continue where you left off</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-2xl font-semibold text-white mb-2">No conversations yet</h3>
            <p className="text-gray-400 mb-6">Start a new chat to begin your AI journey</p>
            <button
              onClick={() => navigate('/new-chat')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/30"
            >
              Start New Chat
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {sessions.map((session) => (
              <div
                key={session._id}
                className="group relative bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 hover:border-blue-500/50 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/10"
                onClick={() => navigate(`/chat/${session._id}`)}
              >
                <button
                  onClick={(e) => handleDelete(session._id, e)}
                  className="absolute top-4 right-4 md:opacity-0 md:group-hover:opacity-100 hover:scale-110 transition-all duration-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <div className="flex items-center gap-4 pr-12">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-2xl">
                    💬
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                      {session.sessionTitle || 'Untitled Chat'}
                    </h3>
                    <p className="text-sm text-gray-500">Click to continue</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Mychats;