# 🧠 LeetCode Revision Tracker - Complete Project

A full-stack application to help you master LeetCode problems using spaced repetition, with automatic submission verification and a stunning landing page.

## 🌟 Project Overview

This project consists of three main components:

### 1. **Landing Page** (Port 3001)
- Professional marketing site built with React + Vite
- Animated matrix-style background (LetterGlitch effect)
- Features, How It Works, and CTA sections
- **Location**: `/landing`

### 2. **Frontend App** (Port 3000)
- Main dashboard application with React
- Question tracking with checkbox-based verification
- Settings page for LeetCode integration
- **Location**: `/frontend`

### 3. **Backend API** (Port 5000)
- Node.js + Express REST API
- MongoDB database for user data
- LeetCode GraphQL API integration
- JWT authentication
- **Location**: `/backend`

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

### 1. Install All Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install landing page dependencies
cd ../landing
npm install
```

### 2. Configure Environment

Create `backend/.env`:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here
PORT=5000
```

### 3. Run Everything

**Option A: Run all services together (from root)**
```bash
npm run dev
```

**Option B: Run services individually**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm start
```

Terminal 3 - Landing Page:
```bash
cd landing
npm run dev
```

## 🌐 Access Points

- **Landing Page**: http://localhost:3001
- **Main App**: http://localhost:3000
- **API**: http://localhost:5000/api

## 📦 Project Structure

```
ProjectX/
├── landing/                    # Landing page (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   └── LetterGlitch.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── frontend/                   # Main app (React)
│   ├── src/
│   │   ├── components/
│   │   │   ├── QuestionList.js
│   │   │   ├── AddQuestionForm.js
│   │   │   ├── Navbar.js
│   │   │   ├── Settings.js
│   │   │   └── StatsCard.js
│   │   ├── pages/
│   │   │   ├── Dashboard.js
│   │   │   ├── Login.js
│   │   │   └── Signup.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   └── services/
│   │       └── api.js
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/                    # API server (Node.js)
│   ├── routes/
│   │   ├── auth.js
│   │   └── questions.js
│   ├── models/
│   │   ├── User.js
│   │   └── Question.js
│   ├── services/
│   │   ├── leetcodeService.js
│   │   └── reminderService.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   └── package.json
│
├── extension/                  # Chrome extension (optional)
│   ├── manifest.json
│   ├── popup.html
│   ├── popup.js
│   └── background.js
│
├── docs/                       # Documentation
│   ├── VERIFICATION_UPDATE_20_SUBMISSIONS.md
│   ├── AUTO_VERIFICATION_SYSTEM.md
│   ├── SMART_AUTO_VERIFICATION.md
│   └── ...
│
└── package.json                # Root package (runs all services)
```

## ✨ Key Features

### 🧠 Spaced Repetition
- Questions get 2 automatic reminders: 1 week and 1 month after adding
- Science-backed intervals for maximum retention
- Track revision count and dates

### 🔗 LeetCode Integration
- Fetches question metadata from LeetCode
- Syncs with your LeetCode profile
- Displays your solving statistics

### ✅ Smart Verification
- **Checkbox-based manual verification**
- Fetches your last 20 accepted submissions
- Only counts submissions made **AFTER** adding to tracker
- Shows detailed error messages if verification fails
- No blind acceptance - ensures honest progress

### 📊 Dashboard Features
- **Due Today**: Questions due for revision today
- **Due This Week**: Upcoming revisions this week
- **Fully Revised**: Completed all revision cycles
- Difficulty breakdown (Easy/Medium/Hard)
- Filter and sort options

### 🎯 User Experience
- Clean list view with checkboxes
- Real-time verification feedback
- Link to LeetCode problems
- Tag display for quick reference
- Delete functionality

## 🔧 Tech Stack

### Frontend
- **React 18** - UI library
- **React Router** - Routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Vite** - Build tool (landing page)

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Axios** - LeetCode API calls

### DevOps
- **Nodemon** - Auto-restart server
- **Concurrently** - Run multiple services
- **ESLint** - Code linting

## 📖 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/leetcode-username` - Update LeetCode username

### Questions
- `GET /api/questions` - Get all questions (with filters)
- `POST /api/questions` - Add new question
- `PUT /api/questions/:id/revise` - **Verify & mark as revised**
- `DELETE /api/questions/:id` - Delete question
- `POST /api/questions/:id/verify-submission` - Check verification status
- `POST /api/questions/bulk-verify` - Bulk verify questions

### Stats
- `GET /api/questions/stats/dashboard` - Get dashboard statistics
- `GET /api/questions/leetcode-activity` - Get LeetCode profile stats

## 🎨 Landing Page Features

- **Animated Background**: Matrix-style LetterGlitch effect
- **Hero Section**: Bold headline with CTA buttons
- **Features Grid**: 6 key features with icons
- **How It Works**: 4-step process explanation
- **Stats Bar**: Quick metrics display
- **Responsive Design**: Mobile, tablet, and desktop
- **Smooth Animations**: Fade-in, slide-up, hover effects
- **Sticky Navigation**: Blur effect on scroll

## 🔐 Security

- JWT token-based authentication
- Passwords hashed with bcrypt
- Protected API routes
- CORS configuration
- Environment variables for secrets

## 📝 Verification Logic

```javascript
// How verification works:
1. User clicks checkbox on a question
2. Frontend calls: PUT /api/questions/:id/revise
3. Backend checks:
   - Does user have LeetCode username set?
   - Extract titleSlug from question URL
   - Fetch last 20 accepted submissions from LeetCode
   - Find matching problem (case-insensitive)
   - Check if submission timestamp >= question.dateAdded
4. Response:
   - ✅ Success: Mark as revised, return success
   - ❌ Failure: Return error message, don't mark
5. Frontend updates:
   - Success: Check the checkbox, refresh list
   - Failure: Show error message below the row
```

## 🐛 Troubleshooting

### Backend won't start
- Check MongoDB is running
- Verify `.env` file exists with correct values
- Check port 5000 is not in use

### Frontend won't connect to backend
- Ensure backend is running on port 5000
- Check CORS settings in `backend/server.js`
- Verify API base URL in `frontend/src/services/api.js`

### Verification always fails
- Ensure LeetCode username is set in Settings
- Check username is correct (case-sensitive)
- Verify you solved the problem AFTER adding it
- Check console logs for detailed error messages

### Landing page not loading
- Run `npm install` in `/landing` directory
- Check port 3001 is not in use
- Verify Vite config in `vite.config.js`

## 📚 Documentation

Detailed documentation available in `/docs`:
- `VERIFICATION_UPDATE_20_SUBMISSIONS.md` - Submission fetching logic
- `AUTO_VERIFICATION_SYSTEM.md` - (Deprecated) Old auto-verification
- `SMART_AUTO_VERIFICATION.md` - Verification improvements
- `DEPLOYMENT_GUIDE.md` - Production deployment
- `QUICKSTART.md` - Getting started guide
- `VISUAL_GUIDE.md` - UI/UX guide

## 🚀 Deployment

### Backend (Heroku/Railway/Render)
```bash
cd backend
# Set environment variables on hosting platform
# Deploy via Git or platform CLI
```

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy /build directory
```

### Landing Page (Vercel/Netlify)
```bash
cd landing
npm run build
# Deploy /dist directory
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- LeetCode for their GraphQL API
- React and Vite communities
- Tailwind CSS team
- MongoDB team
- All contributors

---

**Built with ❤️ to help developers master LeetCode through spaced repetition**

## 🎯 Next Steps

1. Visit the landing page: http://localhost:3001
2. Sign up for an account: http://localhost:3000/signup
3. Add your first LeetCode problem
4. Set your LeetCode username in Settings
5. Solve problems and verify your progress!

**Happy Coding! 🚀**
