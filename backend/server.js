const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');

// Load environment variables FIRST
dotenv.config();

// Now load passport (which needs env variables)
const passport = require('./config/passport');

// Import routes
const authRoutes = require('./routes/auth');
const questionRoutes = require('./routes/questions');
const listRoutes = require('./routes/lists');
const aiCoachRoutes = require('./routes/aiCoach');
const notesRoutes = require('./routes/notes');
const notificationRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');

// Import reminder service
const { checkReminders } = require('./services/reminderService');
const { initAICoachCron } = require('./services/aiCoachCron');
const { initLeetCodeSyncCron } = require('./services/leetcodeSyncCron');

const app = express();

// Get allowed origins from environment variables
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.LANDING_URL,
  'http://localhost:3000', // Dev frontend
  'http://localhost:3001'  // Dev landing
].filter(Boolean); // Remove undefined values

console.log('🌐 Allowed CORS origins:', allowedOrigins);

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn('⚠️ CORS blocked origin:', origin);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: 'Infinity' }));
app.use(express.urlencoded({ extended: true, limit: 'Infinity' }));
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

// Serve uploaded files with proper path
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/algotick')
.then(async () => {
  console.log('✅ MongoDB connected successfully');
  
  // Initialize cron jobs after database connection
  try {
    await initAICoachCron();
    await initLeetCodeSyncCron();
    console.log('✅ Cron jobs initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing cron jobs:', error);
  }
})
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/ai-coach', aiCoachRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Health check routes (for external monitoring/keep-alive services)
app.get('/health', (req, res) => {
  res.status(200).send('ok');
});

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
