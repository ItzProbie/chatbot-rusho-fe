import { useState } from 'react';
import Login from '../components/Login';
import Signup from '../components/Signup';

const Home = () => {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">AI Chatbot</h1>
          <p className="text-gray-400">Your intelligent conversation partner</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-6 bg-gray-800/50 p-1 rounded-lg backdrop-blur-sm">
          <button
            onClick={() => setShowLogin(true)}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-300 ${
              showLogin 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setShowLogin(false)}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-300 ${
              !showLogin 
                ? 'bg-green-600 text-white shadow-lg shadow-green-500/50' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form Container */}
        {showLogin ? <Login /> : <Signup />}
      </div>
    </div>
  );
};

export default Home;