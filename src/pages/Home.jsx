import { useState } from 'react';
import Login from '../components/Login';
import Signup from '../components/Signup';

const Home = () => {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setShowLogin(true)}
            className={`flex-1 py-2 rounded-lg font-semibold transition ${
              showLogin ? 'bg-white text-blue-600' : 'bg-white/20 text-white'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setShowLogin(false)}
            className={`flex-1 py-2 rounded-lg font-semibold transition ${
              !showLogin ? 'bg-white text-green-600' : 'bg-white/20 text-white'
            }`}
          >
            Sign Up
          </button>
        </div>
        {showLogin ? <Login /> : <Signup />}
      </div>
    </div>
  );
};

export default Home;