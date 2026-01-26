import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMySessions, deleteSession } from '../api';
import Header from '../components/Header';

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

  const handleDelete = async (sessionId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this chat?')) return;
    
    try {
      await deleteSession(sessionId);
      setSessions(sessions.filter(s => s._id !== sessionId));
      if (localStorage.getItem('currentSessionId') === sessionId) {
        localStorage.removeItem('currentSessionId');
      }
    } catch (error) {
      alert('Failed to delete session');
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await getMySessions();
      setSessions(response.data.sessions);
    } catch (error) {
      alert('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <Header title="My Chats" showBack={true} />
      <div className="max-w-4xl mx-auto p-4">
        {loading ? (
          <div className="text-white text-center">Loading...</div>
        ) : sessions.length === 0 ? (
          <div className="bg-white p-8 rounded-lg text-center">
            <p className="text-gray-600">No chats yet. Start a new conversation!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session._id}
                onClick={() => navigate(`/chat/${session._id}`)}
                className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition cursor-pointer flex justify-between items-center"
              >
                <h3 className="font-semibold">{session.sessionTitle || 'Untitled Chat'}</h3>
                <button
                  onClick={(e) => handleDelete(session._id, e)}
                  className="text-red-500 hover:text-red-700 px-3 py-1 rounded hover:bg-red-50 transition"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Mychats;