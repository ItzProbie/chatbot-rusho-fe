import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMoodAnalysisByDateRange } from '../api';
import Header from '../components/Header';

const MoodAnalysis = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('7days');
  const [averageMood, setAverageMood] = useState(null);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const fetchMoodAnalysis = async () => {
    if (timeRange === 'custom') {
      if (!customStartDate || !customEndDate) return;
      if (new Date(customStartDate) > new Date(customEndDate)) {
        alert('Start date must be before or equal to end date');
        return;
      }
    }

    setLoading(true);
    try {
      let startDate, endDate;
      
      if (timeRange === 'custom') {
        if (!customStartDate || !customEndDate) {
          setLoading(false);
          return;
        }
        startDate = customStartDate;
        endDate = customEndDate;
      } else {
        endDate = new Date().toISOString().split('T')[0];
        const start = new Date();
        
        if (timeRange === '7days') start.setDate(start.getDate() - 7);
        else if (timeRange === '30days') start.setDate(start.getDate() - 30);
        else if (timeRange === '90days') start.setDate(start.getDate() - 90);
        
        startDate = start.toISOString().split('T')[0];
      }
      
      const response = await getMoodAnalysisByDateRange(startDate, endDate);
      setAverageMood(response.data.averageMood);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
  }, [navigate]);

  const getColor = (value) => {
    if (value >= 7) return 'text-red-400';
    if (value >= 4) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Header title="Mood Analysis" showBack={true} />
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Your Mental Health Dashboard</h1>
          <p className="text-gray-400">Track your emotional wellbeing across sessions</p>
        </div>

        <div className="mb-6 flex gap-4 items-end">
          <div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              style={{ 
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239CA3AF' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem'
              }}
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {timeRange === 'custom' && (
            <>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Start Date</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="h-10 px-4 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">End Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="h-10 px-4 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          <button
            onClick={fetchMoodAnalysis}
            disabled={loading || (timeRange === 'custom' && (!customStartDate || !customEndDate || new Date(customStartDate) > new Date(customEndDate)))}
            className="px-3 py-2.5 bg-blue-600 hover:bg-green-600 text-white rounded-lg text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : averageMood ? (
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Average Mood Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">Anxiety</p>
                <p className={`text-5xl font-bold ${getColor(averageMood.anxiety)}`}>
                  {averageMood.anxiety.toFixed(1)}/10
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">Stress</p>
                <p className={`text-5xl font-bold ${getColor(averageMood.stress)}`}>
                  {averageMood.stress.toFixed(1)}/10
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">Depression</p>
                <p className={`text-5xl font-bold ${getColor(averageMood.depression)}`}>
                  {averageMood.depression.toFixed(1)}/10
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">Overall</p>
                <p className={`text-5xl font-bold ${averageMood.overall >= 7 ? 'text-green-400' : averageMood.overall >= 4 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {averageMood.overall.toFixed(1)}/10
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-2xl font-semibold text-white mb-2">No analysis yet</h3>
            <p className="text-gray-400">Select a time range and click "Analyze Mood" to see your data</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodAnalysis;
