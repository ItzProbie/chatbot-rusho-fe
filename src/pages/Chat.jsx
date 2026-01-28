import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { chat as chatAPI, getSession, deleteSession } from '../api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Header from '../components/Header';
import '../styles/markdown.css';
import toast from 'react-hot-toast';

const Chat = () => {
  const navigate = useNavigate();
  const { sessionId: urlSessionId } = useParams();
  const [sessionId, setSessionId] = useState(urlSessionId);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');
    
    if (!token || !userName) {
      localStorage.clear();
      navigate('/');
      return;
    }

    // Load existing session messages if sessionId exists
    if (sessionId) {
      localStorage.setItem('currentSessionId', sessionId);
      const loadSession = async () => {
        try {
          const response = await getSession(sessionId);
          setMessages(response.data.session.messages);
        } catch (error) {
          toast.error('Failed to load session');
        }
      };
      loadSession();
    }
  }, [navigate, sessionId]);

  const handleDelete = async () => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-white">Delete this chat?</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await deleteSession(sessionId);
                localStorage.removeItem('currentSessionId');
                toast.success('Chat deleted');
                navigate('/dashboard');
              } catch {
                toast.error('Failed to delete session');
              }
            }}
            className="px-3 py-1 bg-red-600 text-white rounded"
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 bg-gray-600 text-white rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const payload = { mssg: input };
      if (sessionId) payload.sessionId = sessionId;
      
      const response = await chatAPI(payload);
      const aiMessage = { role: 'ai', content: response.data.response };
      setMessages(prev => [...prev, aiMessage]);
      
      // Store sessionId from response for subsequent messages
      if (!sessionId && response.data.sessionId) {
        setSessionId(response.data.sessionId);
        localStorage.setItem('currentSessionId', response.data.sessionId);
      }
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Header title="AI Assistant" showBack={true} showDelete={!!sessionId} onDelete={handleDelete} />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-20">
            <p className="text-6xl mb-4">💬</p>
            <p className="text-xl">Start a conversation with the AI assistant</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs md:max-w-md lg:max-w-2xl px-4 py-3 rounded-xl shadow-lg ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' 
                  : 'bg-gray-800/50 backdrop-blur-sm text-gray-100 border border-gray-700/50'
              }`}>
                {msg.role === 'user' ? (
                  msg.content
                ) : (
                  <div className="markdown-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 px-4 py-3 rounded-xl shadow-lg">
              <span className="animate-pulse text-gray-300">AI is typing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-gray-900/50 backdrop-blur-md border-t border-gray-700/50 p-4">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;