import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMoodAnalysisByDateRange } from '../api';
import Header from '../components/Header';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const MoodAnalysis = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('7days');
  const [averageMood, setAverageMood] = useState(null);
  const [sessionsData, setSessionsData] = useState([]);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showRemedies, setShowRemedies] = useState(false);
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

  const generatePDF = async () => {
    toast.loading('Generating PDF...');
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      
      // Title
      pdf.setFontSize(18);
      pdf.setTextColor(59, 130, 246);
      pdf.text('Mental Health Report', pageWidth / 2, 15, { align: 'center' });
      
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      const periodText = timeRange === 'custom' 
        ? `${customStartDate} to ${customEndDate}` 
        : timeRange === '7days' ? 'Last 7 Days' 
        : timeRange === '30days' ? 'Last 30 Days' 
        : 'Last 90 Days';
      pdf.text(`Generated: ${new Date().toLocaleDateString()} | Period: ${periodText}`, pageWidth / 2, 22, { align: 'center' });
      
      // Average Scores
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Average Mood Analysis', 20, 32);
      
      pdf.setFontSize(10);
      pdf.text(`Anxiety: ${averageMood.anxiety.toFixed(1)}/10`, 20, 40);
      pdf.text(`Stress: ${averageMood.stress.toFixed(1)}/10`, 20, 46);
      pdf.text(`Depression: ${averageMood.depression.toFixed(1)}/10`, 20, 52);
      pdf.text(`Wellbeing Index: ${averageMood.overall.toFixed(1)}/10`, 20, 58);
      
      // Capture charts
      const chartsDiv = document.querySelector('.grid.grid-cols-1.lg\\:grid-cols-2');
      if (chartsDiv) {
        await new Promise(resolve => setTimeout(resolve), 1500);
        const canvas = await html2canvas(chartsDiv, { scale: 2, backgroundColor: '#1f2937', logging: false });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - 40;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 20, 65, imgWidth, Math.min(imgHeight, 100));
      }
      
      // Trends chart on same page if exists
      if (sessionsData.length > 0) {
        pdf.setFontSize(12);
        pdf.text('Mood Trends Over Time', 20, 172);
        
        const trendsDiv = document.querySelectorAll('.bg-gray-800\\/30.backdrop-blur-sm.border.border-gray-700\\/50.rounded-2xl.p-4.md\\:p-8')[2];
        if (trendsDiv) {
          const canvas = await html2canvas(trendsDiv, { scale: 2, backgroundColor: '#1f2937' });
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = pageWidth - 40;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          pdf.addImage(imgData, 'PNG', 20, 180, imgWidth, Math.min(imgHeight, 90));
        }
        
        pdf.addPage();
        
        // Individual metric graphs - 2 per page
        const metrics = ['anxiety', 'stress', 'depression', 'wellbeing'];
        const metricNames = ['Anxiety', 'Stress', 'Depression', 'Wellbeing Index'];
        
        for (let i = 0; i < metrics.length; i += 2) {
          if (i > 0) pdf.addPage();
          
          for (let j = 0; j < 2 && (i + j) < metrics.length; j++) {
            const idx = i + j;
            const yPos = j === 0 ? 20 : 145;
            
            pdf.setFontSize(12);
            pdf.text(`${metricNames[idx]} Trend`, 20, yPos);
            
            const chartData = sessionsData.map(s => ({
              date: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              value: metrics[idx] === 'wellbeing' ? s.overall : s[metrics[idx]]
            }));
            
            const canvas = document.createElement('canvas');
            canvas.width = 800;
            canvas.height = 350;
            const ctx = canvas.getContext('2d');
            
            ctx.fillStyle = '#1f2937';
            ctx.fillRect(0, 0, 800, 350);
            
            ctx.strokeStyle = ['#EF4444', '#F59E0B', '#3B82F6', '#10B981'][idx];
            ctx.lineWidth = 3;
            ctx.beginPath();
            
            const padding = 60;
            const chartWidth = 800 - 2 * padding;
            const chartHeight = 350 - 2 * padding;
            
            chartData.forEach((point, index) => {
              const x = padding + (index / (chartData.length - 1)) * chartWidth;
              const y = padding + chartHeight - (point.value / 10) * chartHeight;
              if (index === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            });
            ctx.stroke();
            
            ctx.fillStyle = '#9CA3AF';
            ctx.font = '12px Arial';
            for (let k = 0; k <= 10; k++) {
              const y = padding + chartHeight - (k / 10) * chartHeight;
              ctx.fillText(k.toString(), 30, y + 5);
            }
            
            chartData.forEach((point, index) => {
              const x = padding + (index / (chartData.length - 1)) * chartWidth;
              ctx.fillText(point.date, x - 20, 350 - 20);
            });
            
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 20, yPos + 5, pageWidth - 40, 110);
          }
        }
      }
      
      // Remedies section
      pdf.addPage();
      pdf.setFontSize(14);
      pdf.setTextColor(59, 130, 246);
      pdf.text('Personalized Remedies', pageWidth / 2, 20, { align: 'center' });
      
      let yPos = 30;
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      
      if (averageMood.stress >= 6) {
        pdf.setFontSize(11);
        pdf.setTextColor(245, 158, 11);
        pdf.text('For Stress:', 20, yPos);
        yPos += 7;
        pdf.setFontSize(8);
        pdf.setTextColor(0, 0, 0);
        pdf.text('• Box breathing (4-4-4-4) - Inhale 4s, hold 4s, exhale 4s, hold 4s', 25, yPos);
        yPos += 5;
        pdf.text('• Progressive Muscle Relaxation - Tense and release each muscle group', 25, yPos);
        yPos += 5;
        pdf.text('• Child\'s Pose (Yoga) - Kneel, sit on heels, fold forward', 25, yPos);
        yPos += 7;
        pdf.setFontSize(7);
        pdf.setTextColor(100, 100, 100);
        pdf.text('Goal: Nervous system calming', 25, yPos);
        yPos += 10;
        pdf.setTextColor(0, 0, 0);
      }
      
      if (averageMood.anxiety >= 6) {
        pdf.setFontSize(11);
        pdf.setTextColor(239, 68, 68);
        pdf.text('For Anxiety:', 20, yPos);
        yPos += 7;
        pdf.setFontSize(8);
        pdf.setTextColor(0, 0, 0);
        pdf.text('• 5-4-3-2-1 Grounding - Name 5 things you see, 4 touch, 3 hear,', 25, yPos);
        yPos += 4;
        pdf.text('  2 smell, 1 taste', 25, yPos);
        yPos += 5;
        pdf.text('• Alternate nostril breathing - Close one nostril, breathe, switch', 25, yPos);
        yPos += 5;
        pdf.text('• Slow walking meditation - Walk slowly, focus on each step', 25, yPos);
        yPos += 7;
        pdf.setFontSize(7);
        pdf.setTextColor(100, 100, 100);
        pdf.text('Goal: Bring attention out of future fear -> present moment', 25, yPos);
        yPos += 10;
        pdf.setTextColor(0, 0, 0);
      }
      
      if (averageMood.depression >= 6) {
        pdf.setFontSize(11);
        pdf.setTextColor(59, 130, 246);
        pdf.text('For Depression:', 20, yPos);
        yPos += 7;
        pdf.setFontSize(8);
        pdf.setTextColor(0, 0, 0);
        pdf.text('• Brisk walking (10-20 min) - Fast-paced walk outdoors', 25, yPos);
        yPos += 5;
        pdf.text('• Sun salutation (Surya Namaskar) - 12-step yoga sequence', 25, yPos);
        yPos += 5;
        pdf.text('• Power poses (standing, chest open) - Stand tall, arms up/out for 2 min', 25, yPos);
        yPos += 7;
        pdf.setFontSize(7);
        pdf.setTextColor(100, 100, 100);
        pdf.text('Goal: Behavioral activation', 25, yPos);
      }
      
      pdf.save(`mood-analysis-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.dismiss();
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to generate PDF');
      console.error(error);
    }
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
              onChange={(e) => {
                setTimeRange(e.target.value);
                setAverageMood(null);
                setSessionsData([]);
              }}
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

          <button
            onClick={() => setShowRemedies(true)}
            disabled={!averageMood}
            className="w-full md:w-auto px-3 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            View Remedies
          </button>

          <button
            onClick={generatePDF}
            disabled={!averageMood}
            className="w-full md:w-auto px-3 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Report
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
                <div className="grid grid-cols-2 gap-4 md:gap-6 flex-1 items-center justify-items-center">
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
                <ResponsiveContainer width="100%" height={250}>
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
                      labelLine={true}
                      label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }) => {
                        const RADIAN = Math.PI / 180;
                        const radius = innerRadius + (outerRadius - innerRadius) * 1.5;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        return (
                          <text 
                            x={x} 
                            y={y} 
                            fill="#E5E7EB" 
                            textAnchor={x > cx ? 'start' : 'end'} 
                            dominantBaseline="central"
                            style={{ fontSize: '14px', fontWeight: '500', pointerEvents: 'none' }}
                          >
                            {`${name}: ${value.toFixed(1)}`}
                          </text>
                        );
                      }}
                      outerRadius={70}
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
                    <Legend wrapperStyle={{ color: '#9CA3AF' }} />
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

        {showRemedies && averageMood && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowRemedies(false)}>
            <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Personalized Remedies</h2>
                <button onClick={() => setShowRemedies(false)} className="text-gray-400 hover:text-white text-2xl">&times;</button>
              </div>
              
              <div className="space-y-4">
                {averageMood.stress >= 6 && (
                  <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-orange-400 mb-2">For Stress</h3>
                    <ul className="text-gray-300 space-y-2 text-sm">
                      <li>• Box breathing (4-4-4-4) - Inhale 4s, hold 4s, exhale 4s, hold 4s</li>
                      <li>• Progressive Muscle Relaxation - Tense and release each muscle group</li>
                      <li>• Child's Pose (Yoga) - Kneel, sit on heels, fold forward</li>
                    </ul>
                    <p className="text-gray-400 text-xs mt-2 italic">Goal: Nervous system calming</p>
                  </div>
                )}

                {averageMood.anxiety >= 6 && (
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-red-400 mb-2">For Anxiety</h3>
                    <ul className="text-gray-300 space-y-2 text-sm">
                      <li>• 5-4-3-2-1 Grounding - Name 5 things you see, 4 touch, 3 hear, 2 smell, 1 taste</li>
                      <li>• Alternate nostril breathing - Close one nostril, breathe, switch</li>
                      <li>• Slow walking meditation - Walk slowly, focus on each step</li>
                    </ul>
                    <p className="text-gray-400 text-xs mt-2 italic">Goal: Bring attention out of future fear -&gt; present moment</p>
                  </div>
                )}

                {averageMood.depression >= 6 && (
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-400 mb-2">For Depression</h3>
                    <ul className="text-gray-300 space-y-2 text-sm">
                      <li>• Brisk walking (10-20 min) - Fast-paced walk outdoors</li>
                      <li>• Sun salutation (Surya Namaskar) - 12-step yoga sequence</li>
                      <li>• Power poses (standing, chest open) - Stand tall, arms up/out for 2 min</li>
                    </ul>
                    <p className="text-gray-400 text-xs mt-2 italic">Goal: Behavioral activation</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodAnalysis;
