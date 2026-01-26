import { useNavigate } from 'react-router-dom';

const Header = ({ title = "AI Assistant", showBack = false, showDelete = false, onDelete }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="bg-white shadow p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">{title}</h1>
      <div className="flex gap-2">
        {showDelete && (
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Delete
          </button>
        )}
        {showBack && (
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
          >
            Back
          </button>
        )}
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Header;
