import React, { useState } from 'react';
import { Search, User } from 'lucide-react';

const NewDashboard = () => {
  const [selectedTab, setSelectedTab] = useState('all');
  
  // Sample data
  const monthlyData = [
    { month: 'Jun', value: 1500 },
    { month: 'Jul', value: 1800 },
    { month: 'Aug', value: 2000 },
    { month: 'Sep', value: 2200 },
    { month: 'Oct', value: 3045 },
    { month: 'Nov', value: 1900 },
    { month: 'Dec', value: 2100 }
  ];

  const recentProblems = [
    { title: 'Two Sum', difficulty: 'Easy', time: '22m sec', status: 'Accepted' },
    { title: 'Reverse Linked List', difficulty: 'Medium', time: '12m sec', status: 'Accepted' },
    { title: 'Merge Intervals', difficulty: 'Medium', time: '12m sec', status: 'Accepted' }
  ];

  const maxValue = Math.max(...monthlyData.map(d => d.value));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Top Navigation */}
      <div className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">
            AlgoTick
          </h1>
          
          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search bar"
                className="w-full bg-gray-800/50 border border-gray-700/50 rounded-full py-2 pl-10 pr-4 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              />
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3">
            <span className="text-gray-300">Hi Alex Chent</span>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-6">
          {/* Left Sidebar */}
          <div className="w-16 flex flex-col gap-4">
            <button className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 hover:bg-teal-500/30 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </button>
            <button className="w-12 h-12 rounded-xl bg-gray-800/50 border border-gray-700/50 flex items-center justify-center text-gray-400 hover:bg-gray-700/50 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
            <button className="w-12 h-12 rounded-xl bg-gray-800/50 border border-gray-700/50 flex items-center justify-center text-gray-400 hover:bg-gray-700/50 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
            <button className="w-12 h-12 rounded-xl bg-gray-800/50 border border-gray-700/50 flex items-center justify-center text-gray-400 hover:bg-gray-700/50 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </button>
            <button className="w-12 h-12 rounded-xl bg-gray-800/50 border border-gray-700/50 flex items-center justify-center text-gray-400 hover:bg-gray-700/50 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </button>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex gap-6">
            {/* Left Column */}
            <div className="flex-1 space-y-6">
              {/* Coding Consistency Section */}
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
                <h2 className="text-3xl font-bold text-white mb-6">Coding Consistency</h2>
                
                {/* Tabs */}
                <div className="flex gap-3 mb-6">
                  <button
                    onClick={() => setSelectedTab('all')}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedTab === 'all'
                        ? 'bg-teal-500 text-white'
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setSelectedTab('practice')}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedTab === 'practice'
                        ? 'bg-teal-500 text-white'
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Practice
                  </button>
                  <button
                    onClick={() => setSelectedTab('stats')}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedTab === 'stats'
                        ? 'bg-teal-500 text-white'
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Stats
                  </button>
                </div>

                {/* Chart */}
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/30">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Coding Consistency</h3>
                    <button className="text-teal-400 text-sm flex items-center gap-1 hover:text-teal-300">
                      View all
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  {/* Bar Chart */}
                  <div className="h-64 flex items-end justify-between gap-4">
                    {monthlyData.map((data, index) => {
                      const isOct25 = data.month === 'Oct';
                      const height = (data.value / maxValue) * 100;
                      
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center gap-2">
                          <div className="relative w-full flex flex-col justify-end" style={{ height: '200px' }}>
                            {isOct25 && (
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-700/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                                Oct 25
                              </div>
                            )}
                            <div
                              className={`w-full rounded-lg transition-all ${
                                isOct25
                                  ? 'bg-gradient-to-t from-teal-400 to-emerald-400'
                                  : 'bg-gradient-to-t from-teal-600/30 to-emerald-600/30'
                              }`}
                              style={{ 
                                height: `${height}%`,
                                backgroundImage: isOct25 
                                  ? 'linear-gradient(to top, rgb(45, 212, 191), rgb(52, 211, 153))'
                                  : 'repeating-linear-gradient(45deg, rgba(45, 212, 191, 0.1), rgba(45, 212, 191, 0.1) 2px, transparent 2px, transparent 6px)'
                              }}
                            />
                          </div>
                          <span className="text-gray-400 text-sm">{data.month}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
                    <span>3.0k$</span>
                    <span>2.8k$</span>
                    <span>2.0k$</span>
                    <span>1.8k$</span>
                    <span>1.0k$</span>
                    <span>0.0$</span>
                  </div>
                </div>
              </div>

              {/* AI Coach Section */}
              <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-white">AI Coach</h3>
                    <span className="text-2xl">🤖</span>
                  </div>
                  <button className="text-teal-400 text-sm flex items-center gap-1 hover:text-teal-300">
                    View all
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-teal-400 text-sm font-medium mb-1">Feedback:</p>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      Your are<span className="text-red-400">excessive</span> to your<span className="text-red-400">circui incammustton</span> stors with aseming feedback and complete strateg#ies are <span className="text-teal-400">recommende</span>.
                    </p>
                  </div>

                  <div>
                    <p className="text-teal-400 text-sm font-medium mb-1">Recommendation:</p>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      Track your expenses daily to avoid income overspending to the track anstl Tracks and allocats and categorize them to better manage your budget.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="w-80 space-y-6">
              {/* Weekly Goal Card */}
              <div className="bg-gradient-to-br from-teal-900/30 to-emerald-900/30 backdrop-blur-sm rounded-2xl border border-teal-500/30 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Weekly Goal</h3>
                  <button className="text-teal-400 text-sm flex items-center gap-1 hover:text-teal-300">
                    View all
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Circular Progress */}
                <div className="flex justify-center mb-6">
                  <div className="relative w-40 h-40">
                    <svg className="transform -rotate-90 w-40 h-40">
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-gray-700"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 70}`}
                        strokeDashoffset={`${2 * Math.PI * 70 * (1 - 0.0)}`}
                        className="text-teal-400"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-white">0 / 30</span>
                      <span className="text-sm text-gray-400">Slots progress</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                  <span className="text-gray-400 text-sm">Goal of the Week</span>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-teal-400 text-sm">Stats</span>
                      <span className="text-white font-semibold ml-2">325</span>
                    </div>
                    <div className="text-right">
                      <span className="text-white font-semibold">80%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Solved Problems */}
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Recent Solved Problems</h3>
                  <button className="text-teal-400 text-sm flex items-center gap-1 hover:text-teal-300">
                    View all
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  {recentProblems.map((problem, index) => (
                    <div 
                      key={index}
                      className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/30 hover:border-teal-500/30 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-white font-medium">{problem.title}</h4>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className={`${
                              problem.difficulty === 'Easy' 
                                ? 'text-green-400' 
                                : 'text-yellow-400'
                            }`}>
                              ({problem.difficulty})
                            </span>
                            <span className="text-teal-400">{problem.status}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Time: {problem.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewDashboard;
