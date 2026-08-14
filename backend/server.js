const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cron = require("node-cron");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const os = require("os");
const path = require("path");

function getLanIPv4s() {
  const addresses = [];
  for (const ifaces of Object.values(os.networkInterfaces())) {
    for (const iface of ifaces || []) {
      const family = iface.family;
      if ((family === "IPv4" || family === 4) && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  return addresses;
}

// Load environment variables FIRST
dotenv.config();

// Now load passport (which needs env variables)
const passport = require("./config/passport");

// Import routes
const authRoutes = require("./routes/auth");
const questionRoutes = require("./routes/questions");
const listRoutes = require("./routes/lists");
const aiCoachRoutes = require("./routes/aiCoach");
const notesRoutes = require("./routes/notes");
const notificationRoutes = require("./routes/notifications");
const adminRoutes = require("./routes/admin");

// Import reminder service
const { checkReminders } = require("./services/reminderService");
const { initAICoachCron } = require("./services/aiCoachCron");
const { initLeetCodeSyncCron } = require("./services/leetcodeSyncCron");
const { initRedis, isRedisReady } = require("./config/redisClient");

const app = express();

// Get allowed origins from environment variables
const lanIps = getLanIPv4s();
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.LANDING_URL,
  "http://localhost:3000", // Dev frontend
  "http://localhost:3001", // Dev landing
  ...lanIps.flatMap((ip) => [
    `http://${ip}:3000`,
    `http://${ip}:3001`,
  ]),
]
  .filter(Boolean)
  .map((origin) => origin.replace(/\/$/, ""));

console.log("🌐 Allowed CORS origins:", allowedOrigins);

function isEditorPreviewOrigin(origin) {
  return (
    origin.startsWith("vscode-file://") ||
    origin.startsWith("vscode-webview://") ||
    origin.startsWith("cursor://")
  );
}

// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, etc)
      if (!origin) return callback(null, true);

      const normalized = origin.replace(/\/$/, "");
      if (allowedOrigins.indexOf(normalized) !== -1) {
        callback(null, true);
      } else {
        if (!isEditorPreviewOrigin(origin)) {
          console.warn("⚠️ CORS blocked origin:", origin);
        }
        callback(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json({ limit: "Infinity" }));
app.use(express.urlencoded({ extended: true, limit: "Infinity" }));
app.use(cookieParser());

// Session configuration (required for Passport)
app.use(
  session({
    secret:
      process.env.SESSION_SECRET || "your-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Serve uploaded files with proper path
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Database connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/algotick")
  .then(async () => {
    console.log("✅ MongoDB connected successfully");

    // Initialize Redis (optional — app still works if unavailable)
    await initRedis();

    // Initialize cron jobs after database connection
    try {
      await initAICoachCron();
      await initLeetCodeSyncCron();
      console.log("✅ Cron jobs initialized successfully");
    } catch (error) {
      console.error("❌ Error initializing cron jobs:", error);
    }
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/lists", listRoutes);
app.use("/api/ai-coach", aiCoachRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);

// Health check routes (for external monitoring/keep-alive services)
app.get("/health", (req, res) => {
  res.status(200).send("ok");
});

app.get("/api/health", (req, res) => {
  const { getRedisMode } = require("./config/redisClient");
  res.json({
    status: "ok",
    message: "LeetCode Tracker API is running",
    redis: isRedisReady() ? getRedisMode() : "disabled",
    timestamp: new Date().toISOString(),
  });
});

// Schedule reminder checks (runs every day at 8 AM)
cron.schedule("0 8 * * *", () => {
  console.log("🔔 Running daily reminder check...");
  checkReminders();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

// Start server — bind on all interfaces so phones on the same Wi-Fi can reach it
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";
app.listen(PORT, HOST, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Local:    http://localhost:${PORT}/api`);
  if (lanIps.length) {
    lanIps.forEach((ip) => {
      console.log(`📍 Network:  http://${ip}:${PORT}/api`);
    });
  } else {
    console.log("📍 Network:  no intranet IPv4 address found");
  }
});

module.exports = app;
