import { useNavigate } from 'react-router-dom';

const Header = ({ title = "AI Assistant", showBack = false, showDelete = false, onDelete }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="bg-gray-900/30 backdrop-blur-md border-b border-gray-700/30 p-4 flex justify-between items-center">
      <h1 className="text-xl font-semibold text-gray-200">{title}</h1>
      <div className="flex gap-2">
        {showDelete && (
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 rounded-lg transition-all duration-300 border border-red-500/30"
          >
            Delete
          </button>
        )}
        {showBack && (
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-gray-700/20 hover:bg-gray-700/30 text-gray-300 rounded-lg transition-all duration-300 border border-gray-600/30"
          >
            Back
          </button>
        )}
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-gray-800/20 hover:bg-gray-800/30 text-gray-300 rounded-lg transition-all duration-300 border border-gray-600/30"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Header;
