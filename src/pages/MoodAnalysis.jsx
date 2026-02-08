import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMoodAnalysisByDateRange } from '../api';
import Header from '../components/Header';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';

const MoodAnalysis = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('7days');
  const [averageMood, setAverageMood] = useState(null);
  const [sessionsData, setSessionsData] = useState([]);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedMetrics, setSelectedMetrics] = useState({
    anxiety: true,
    stress: true,
    depression: true,
    wellbeing: true
  });

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
      setSessionsData(response.data.sessionsData || []);
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || 'Failed to analyze mood';
      toast.error(message);
      setAverageMood(null);
      setSessionsData([]);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-x-hidden">
      <Header title="Mood Analysis" showBack={true} />
      <div className="max-w-6xl mx-auto p-4 md:p-8 overflow-x-hidden">
        <div className="mb-4 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">Your Mental Health Dashboard</h1>
          <p className="text-sm md:text-base text-gray-400">Track your emotional wellbeing across sessions</p>
        </div>

        <div className="mb-6 flex flex-col md:flex-row gap-4 md:items-end">
          <div className="w-full md:w-auto">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
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
              <div className="w-full md:w-auto">
                <label className="block text-gray-400 text-sm mb-1">Start Date</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full h-10 px-4 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="w-full md:w-auto">
                <label className="block text-gray-400 text-sm mb-1">End Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full h-10 px-4 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          <button
            onClick={fetchMoodAnalysis}
            disabled={loading || (timeRange === 'custom' && (!customStartDate || !customEndDate || new Date(customStartDate) > new Date(customEndDate)))}
            className="w-full md:w-auto px-3 py-2.5 bg-blue-600 hover:bg-green-600 text-white rounded-lg text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : averageMood ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 md:p-8 flex flex-col">
                <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 text-center">Average Mood Analysis</h2>
                <div className="grid grid-cols-2 gap-4 md:gap-6 flex-1 items-center">
                  <div className="text-center">
                    <p className="text-gray-400 text-xs md:text-sm mb-2">Anxiety</p>
                    <p className={`text-2xl md:text-4xl font-bold ${getColor(averageMood.anxiety)}`}>
                      {averageMood.anxiety.toFixed(1)}/10
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-xs md:text-sm mb-2">Stress</p>
                    <p className={`text-2xl md:text-4xl font-bold ${getColor(averageMood.stress)}`}>
                      {averageMood.stress.toFixed(1)}/10
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-xs md:text-sm mb-2">Depression</p>
                    <p className={`text-2xl md:text-4xl font-bold ${getColor(averageMood.depression)}`}>
                      {averageMood.depression.toFixed(1)}/10
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-xs md:text-sm mb-2">Wellbeing Index</p>
                    <p className={`text-2xl md:text-4xl font-bold ${averageMood.overall >= 7 ? 'text-green-400' : averageMood.overall >= 4 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {averageMood.overall.toFixed(1)}/10
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 md:p-8">
                <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 text-center">Mood Distribution</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Anxiety', value: averageMood.anxiety, color: '#EF4444' },
                        { name: 'Stress', value: averageMood.stress, color: '#F59E0B' },
                        { name: 'Depression', value: averageMood.depression, color: '#3B82F6' },
                        { name: 'Wellbeing', value: averageMood.overall, color: '#10B981' }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value.toFixed(1)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: 'Anxiety', value: averageMood.anxiety, color: '#EF4444' },
                        { name: 'Stress', value: averageMood.stress, color: '#F59E0B' },
                        { name: 'Depression', value: averageMood.depression, color: '#3B82F6' },
                        { name: 'Wellbeing', value: averageMood.overall, color: '#10B981' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#F3F4F6' }}
                      itemStyle={{ color: '#F3F4F6' }}
                      labelStyle={{ color: '#F3F4F6' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {sessionsData.length > 0 && (
              <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 md:p-8">
                <h2 className="text-xl md:text-2xl font-bold text-white mb-4 text-center">Mood Trends Over Time</h2>
                
                <div className="flex justify-center gap-4 mb-6 flex-wrap">
                  <button
                    onClick={() => setSelectedMetrics(prev => ({ ...prev, anxiety: !prev.anxiety }))}
                    className={`px-4 py-2 rounded-lg transition ${selectedMetrics.anxiety ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-400'}`}
                  >
                    Anxiety
                  </button>
                  <button
                    onClick={() => setSelectedMetrics(prev => ({ ...prev, stress: !prev.stress }))}
                    className={`px-4 py-2 rounded-lg transition ${selectedMetrics.stress ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-400'}`}
                  >
                    Stress
                  </button>
                  <button
                    onClick={() => setSelectedMetrics(prev => ({ ...prev, depression: !prev.depression }))}
                    className={`px-4 py-2 rounded-lg transition ${selectedMetrics.depression ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`}
                  >
                    Depression
                  </button>
                  <button
                    onClick={() => setSelectedMetrics(prev => ({ ...prev, wellbeing: !prev.wellbeing }))}
                    className={`px-4 py-2 rounded-lg transition ${selectedMetrics.wellbeing ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'}`}
                  >
                    Wellbeing Index
                  </button>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={sessionsData.map(s => ({
                    ...s,
                    wellbeing: s.overall,
                    date: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis domain={[0, 10]} stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#F3F4F6' }}
                      itemStyle={{ color: '#F3F4F6' }}
                      labelStyle={{ color: '#F3F4F6' }}
                    />
                    <Legend wrapperStyle={{ color: '#9CA3AF' }} />
                    {selectedMetrics.anxiety && <Line type="monotone" dataKey="anxiety" stroke="#EF4444" strokeWidth={2} dot={{ r: 4 }} />}
                    {selectedMetrics.stress && <Line type="monotone" dataKey="stress" stroke="#F59E0B" strokeWidth={2} dot={{ r: 4 }} />}
                    {selectedMetrics.depression && <Line type="monotone" dataKey="depression" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />}
                    {selectedMetrics.wellbeing && <Line type="monotone" dataKey="wellbeing" name="wellbeing index" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
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
