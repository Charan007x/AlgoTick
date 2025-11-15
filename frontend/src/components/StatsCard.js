import React from 'react';

const StatsCard = ({ title, value, icon, color = 'primary', showTimeFilter, timeFilter, onTimeFilterChange }) => {
  const colorClasses = {
    primary: 'from-[#61dca3]/20 to-[#61b3dc]/20 border-[#61dca3]/30',
    green: 'from-[#61dca3]/20 to-emerald-500/20 border-[#61dca3]/30',
    yellow: 'from-yellow-400/20 to-orange-400/20 border-yellow-400/30',
    red: 'from-red-400/20 to-pink-400/20 border-red-400/30',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} backdrop-blur-md border rounded-2xl p-6 hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer group`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1">
          <p className="text-sm font-medium text-white/70 group-hover:text-white/90 transition-colors">{title}</p>
          <p className="text-4xl font-bold mt-2 text-white group-hover:scale-110 transition-transform inline-block">{value}</p>
        </div>
        <div className="text-5xl opacity-80 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">{icon}</div>
      </div>
      
      {showTimeFilter && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <select
            value={timeFilter}
            onChange={(e) => onTimeFilterChange(e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#61dca3] transition-all"
            style={{ colorScheme: 'dark' }}
          >
            <option value="today" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>Today</option>
            <option value="week" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>This Week</option>
            <option value="month" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>This Month</option>
            <option value="all" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>All Time</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default StatsCard;
