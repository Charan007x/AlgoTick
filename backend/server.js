const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');
const session = require('express-session');
const cookieParser = require('cookie-parser');

// Load environment variables FIRST
dotenv.config();

// Now load passport (which needs env variables)
const passport = require('./config/passport');

// Import routes
const authRoutes = require('./routes/auth');
const questionRoutes = require('./routes/questions');
const listRoutes = require('./routes/lists');

// Import reminder service
const { checkReminders } = require('./services/reminderService');

const app = express();

// Get allowed origins from environment variables
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.LANDING_URL,
  'http://localhost:3000', // Dev frontend
  'http://localhost:3001'  // Dev landing
].filter(Boolean); // Remove undefined values

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration (required for Passport)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/leetcode-tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/lists', listRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'LeetCode Tracker API is running',
    timestamp: new Date().toISOString()
  });
});

// Schedule reminder checks (runs every day at 8 AM)
cron.schedule('0 8 * * *', () => {
  console.log('🔔 Running daily reminder check...');
  checkReminders();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 API endpoint: http://localhost:${PORT}/api`);
});

module.exports = app;
