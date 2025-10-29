# Test Dashboard

This folder contains the experimental test dashboard with **MUI X Charts** integration for advanced data visualizations.

## ✅ Completed Features

### Interactive Charts
- ✅ **Pie Chart** - Problems by Difficulty (Easy/Medium/Hard distribution)
- ✅ **Gauge Chart** - Revision Progress percentage
- ✅ **Bar Chart** - Top 5 Categories by problem count
- ✅ **Line Chart** - Activity Timeline (Last 30 days with area fill)

### Additional Features
- ✅ Stats Overview Cards
- ✅ Isolated routing (doesn't affect main dashboard)
- ✅ Dark theme matching AlgoTick design
- ✅ Interactive hover effects on all charts
- ✅ Responsive layout

## 🎨 Technologies Used

- **MUI X Charts** (@mui/x-charts)
- **MUI Material** (@mui/material)
- **Emotion** (CSS-in-JS for MUI)
- **React** with hooks (useState, useEffect)
- **Tailwind CSS** for layout and styling

## 🚀 Access

Navigate to `/test-dashboard` after logging in, or click the link from your dashboard.

## 📊 Chart Details

### 1. Pie Chart - Problems by Difficulty
- **Location**: Top-left panel
- **Data**: Real-time difficulty distribution
- **Colors**: 
  - Green (#22c55e) for Easy
  - Yellow (#eab308) for Medium
  - Red (#ef4444) for Hard
- **Features**: 
  - Interactive hover with highlighting
  - Faded effect on other segments
  - Legend at bottom

### 2. Gauge Chart - Revision Progress
- **Location**: Top-right panel
- **Data**: Percentage of problems fully revised
- **Color**: AlgoTick green (#61dca3)
- **Features**:
  - Large percentage display in center
  - Shows "X of Y problems fully revised" below
  - Smooth animation

### 3. Bar Chart - Top Categories
- **Location**: Bottom-left panel
- **Data**: Top 5 categories by problem count
- **Color**: AlgoTick green (#61dca3)
- **Features**:
  - Horizontal orientation
  - Category names on Y-axis
  - Problem counts on X-axis
  - Dark theme axes

### 4. Line Chart - Activity Timeline
- **Location**: Bottom-right panel
- **Data**: Daily problem solving count (last 30 days)
- **Color**: AlgoTick blue (#61b3dc)
- **Features**:
  - Area fill under the line
  - Smooth curve
  - Date labels on X-axis
  - Hover tooltips with exact values

## 🎨 Theme Configuration

Custom MUI dark theme matching AlgoTick's design:
```javascript
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#61dca3' },
    secondary: { main: '#61b3dc' },
    background: {
      default: '#000000',
      paper: 'rgba(255, 255, 255, 0.05)',
    },
  },
});
```

## 📊 Data Sources

- **Real data** from `questionsAPI.getDashboardStats()`
- **Real data** from `questionsAPI.getQuestions()`
- Categories data is currently mocked (will be real when custom lists backend is integrated)
- Heatmap data used for activity timeline

## ⚠️ Important Notes

### Isolated Environment
- This test dashboard is **completely isolated** from the main dashboard
- Changes here will **NOT affect** the production dashboard
- Safe for experimentation and testing new features

### Performance
- All charts render smoothly with animations
- Data updates automatically when you solve problems
- Responsive design works on all screen sizes

### Future Enhancements Possible
- [ ] Export charts as images
- [ ] Custom date range selector
- [ ] More chart types (Heatmap, Radar, etc.)
- [ ] Comparison views (weekly vs monthly)
- [ ] Real-time updates via WebSocket
- [ ] Custom color themes
- [ ] Chart customization settings

## 🔧 Development

The test dashboard uses the same API services as the main dashboard:
- No new backend endpoints required
- Uses existing authentication
- Fetches data on component mount
- Loading states handled gracefully

## 📱 Responsive Design

Charts automatically adjust to screen size:
- **Desktop**: 2-column grid layout
- **Tablet**: 2-column grid layout
- **Mobile**: Single column stack

All charts maintain readability on smaller screens.
