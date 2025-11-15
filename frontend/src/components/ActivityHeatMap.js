import React from 'react';

const ActivityHeatMap = ({ heatmapData }) => {
  if (!heatmapData || heatmapData.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-8">
        <h3 className="text-lg font-semibold mb-6 text-white">Activity Heatmap</h3>
        <div className="text-center py-8 text-white/60">
          No activity data yet. Start solving questions to see your heatmap!
        </div>
      </div>
    );
  }

  // Get intensity level based on count (0-4 scale like GitHub)
  const getIntensity = (count) => {
    if (count === 0) return 0;
    if (count === 1) return 1;
    if (count === 2) return 2;
    if (count <= 4) return 3;
    return 4; // 5+
  };

  // Get color based on intensity (using full class names for Tailwind)
  const getColor = (intensity) => {
    switch (intensity) {
      case 0:
        return 'bg-white/5 border border-white/10';
      case 1:
        return 'bg-[#0e4429] border border-[#0e4429]';
      case 2:
        return 'bg-[#006d32] border border-[#006d32]';
      case 3:
        return 'bg-[#26a641] border border-[#26a641]';
      case 4:
        return 'bg-[#39d353] border border-[#39d353]';
      default:
        return 'bg-white/5 border border-white/10';
    }
  };

  // Generate last 12 months ending TODAY
  const months = [];
  const today = new Date();
  
  // Calculate start date (12 months ago from today)
  const startDate = new Date(today);
  startDate.setFullYear(startDate.getFullYear() - 1);
  startDate.setDate(startDate.getDate() + 1); // Start from day after (to make 365 days)
  
  // Generate last 12 months
  for (let monthOffset = 11; monthOffset >= 0; monthOffset--) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - monthOffset, 1);
    const monthName = monthDate.toLocaleString('default', { month: 'short' });
    const year = monthDate.getFullYear();
    const monthIndex = monthDate.getMonth();
    
    // Get number of days in this month
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    
    const weeks = [];
    let currentWeek = [];
    
    // Get the day of week for the 1st of the month (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = new Date(year, monthIndex, 1).getDay();
    
    // Add empty cells for days before the 1st
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push(null);
    }
    
    // Add all days in the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, monthIndex, day);
      
      // Only include dates from startDate to today
      if (date < startDate || date > today) {
        currentWeek.push(null);
      } else {
        const dateYear = date.getFullYear();
        const dateMonth = String(date.getMonth() + 1).padStart(2, '0');
        const dateDay = String(date.getDate()).padStart(2, '0');
        const dateStr = `${dateYear}-${dateMonth}-${dateDay}`;
        
        const dayData = heatmapData.find(d => d.date === dateStr);
        const count = dayData ? dayData.count : 0;
        
        currentWeek.push({
          date: dateStr,
          count,
          intensity: getIntensity(count),
          day: date.getDay(),
          dateObj: date,
          dayOfMonth: day,
          isToday: date.toDateString() === today.toDateString()
        });
      }
      
      // Start a new week after Saturday
      if (date.getDay() === 6) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    }
    
    // Add remaining cells for the last week
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }
    
    // Only add month if it has at least one valid day
    if (weeks.some(week => week.some(day => day !== null))) {
      months.push({
        name: monthName,
        year,
        weeks
      });
    }
  }

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3 sm:p-4 md:p-6 mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 md:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-white">Activity Heatmap</h3>
        <div className="flex items-center gap-2 text-[10px] sm:text-xs text-white/60">
          <span className="hidden sm:inline">Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map(intensity => (
              <div
                key={intensity}
                className={`w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 rounded-sm ${getColor(intensity)}`}
                title={intensity === 0 ? 'No activity' : `${intensity} level`}
              />
            ))}
          </div>
          <span className="hidden sm:inline">More</span>
        </div>
      </div>

      <div className="w-full overflow-x-auto overflow-y-hidden md:overflow-hidden">
        <div className="flex gap-2 sm:gap-3 min-w-max md:min-w-0">
          {/* Vertical day labels */}
          <div className="flex flex-col gap-0.5 sm:gap-1 text-[8px] sm:text-[9px] text-white/40 justify-start pt-[18px] sm:pt-[22px]">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
              <div key={idx} className="h-[8px] sm:h-[10px] flex items-center">
                {day}
              </div>
            ))}
          </div>

          {/* All months in a row */}
          <div className="flex gap-2 sm:gap-3 flex-1 md:justify-between">
            {months.map((month, monthIndex) => (
              <div key={monthIndex} className="flex-shrink-0">
                {/* Month header */}
                <div className="text-[9px] sm:text-[10px] font-semibold text-white/70 mb-1 h-[16px] sm:h-[18px]">
                  {month.name}
                </div>
                
                {/* Calendar grid - weeks as columns, days as rows */}
                <div className="flex gap-[2px] sm:gap-[3px]">
                  {month.weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-0.5 sm:gap-1">
                      {week.map((dayData, dayIndex) => {
                        if (!dayData) {
                          return <div key={dayIndex} className="w-[8px] h-[8px] sm:w-[10px] sm:h-[10px]" />;
                        }

                        const isToday = dayData.isToday;

                        return (
                          <div
                            key={dayIndex}
                            className={`w-[8px] h-[8px] sm:w-[10px] sm:h-[10px] rounded-sm ${getColor(dayData.intensity)} cursor-pointer hover:ring-1 hover:ring-[#39d353] transition-all ${
                              isToday ? 'ring-1 sm:ring-2 ring-blue-400' : ''
                            }`}
                            title={`${dayData.dateObj.toLocaleDateString()}: ${dayData.count} question${dayData.count !== 1 ? 's' : ''} solved${isToday ? ' (Today)' : ''}`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-3 sm:gap-6 text-xs sm:text-sm">
        <div>
          <span className="text-white/60">Total submissions: </span>
          <span className="text-white font-semibold">
            {heatmapData.reduce((sum, d) => sum + d.count, 0)}
          </span>
        </div>
        <div>
          <span className="text-white/60">Current streak: </span>
          <span className="text-white font-semibold">
            {calculateStreak(heatmapData)} days
          </span>
        </div>
      </div>
    </div>
  );
};

// Calculate current streak (consecutive days with at least 1 question solved)
const calculateStreak = (heatmapData) => {
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Use local date string (YYYY-MM-DD) to match heatmap data
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    const dayData = heatmapData.find(d => d.date === dateStr);
    
    if (dayData && dayData.count > 0) {
      streak++;
    } else if (i > 0) {
      // Allow skipping today if not solved yet
      break;
    }
  }

  return streak;
};

export default ActivityHeatMap;
