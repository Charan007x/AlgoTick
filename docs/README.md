# ✓ AlgoTick - Never Forget What You Solved

A full-stack MERN application to master LeetCode problems with proven spaced repetition. Track, revise, and build lasting coding skills.

## ✨ Features

### 🎯 Core Features
- **Smart Question Tracking**: Add via LeetCode URL, slug, or question number
- **Spaced Repetition**: Automatic reminders (1 day, 1 week, 1 month)
- **Auto Verification**: Checks your last 20 LeetCode submissions
- **Custom Lists**: Create themed question lists and add to daily practice
- **Soft Delete**: Preserve revision history even after deleting
- **Activity Heatmap**: GitHub-style 12-month contribution graph

### 🔐 Authentication
- Email/Password authentication with JWT
- Google OAuth 2.0 integration
- Protected routes and sessions

### 📊 Dashboard Analytics
- Real-time statistics (Due Today, Due Week, Fully Revised)
- Time-filtered stats (Today/Week/Month/All Time)
- Activity heatmap with current streak
- Revision history tracking
- Question filtering and sorting

### 🎨 Modern UI/UX
- Glassmorphism design with gradient accents
- Fully responsive (mobile, tablet, desktop)
- Hamburger menu for mobile navigation
- Smooth animations and transitions
- Dark theme throughout
- Loading states and skeletons

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **React Router v6** - Routing
- **TailwindCSS** - Styling
- **Axios** - API client
- **Context API** - State management

### Backend
- **Node.js & Express** - Server
- **MongoDB & Mongoose** - Database
- **JWT** - Authentication
- **Passport.js** - OAuth
- **bcryptjs** - Password hashing

### Landing Page
- **Vite + React** - Fast build tool
- **TailwindCSS** - Styling
- **LetterGlitch** - Animated background

## 📁 Project Structure

```
ProjectX/
├── backend/          # Express API server (port 5000)
├── frontend/         # React app (port 3000)
├── landing/          # Landing page (port 3001)
└── docs/            # Documentation
    ├── QUICKSTART.md
    ├── OAUTH_SETUP_GUIDE.md
    ├── VERIFICATION_EXPLAINED.md
    ├── CUSTOM_LISTS_FEATURE.md
    ├── DEPLOYMENT_GUIDE.md
    ├── API_EXAMPLES.md
    ├── ARCHITECTURE.md
    └── FINAL_CHECKLIST.md
```
ProjectX/
├── backend/
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   └── Question.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── questions.js
│   ├── services/
│   │   ├── leetcodeService.js
│   │   └── reminderService.js
│   ├── .env.example
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   ├── services/
    │   ├── App.js
    │   └── index.js
    ├── tailwind.config.js
    └── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/leetcode-tracker
JWT_SECRET=your_secure_secret_key_here
NODE_ENV=development
```

5. Start MongoDB (if running locally):
```bash
# Windows (if MongoDB is installed as a service)
net start MongoDB

# macOS/Linux
mongod
```

6. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will open at `http://localhost:3000`

## 📖 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/signup
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Question Endpoints (Authenticated)

#### Add Question
```http
POST /api/questions
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://leetcode.com/problems/two-sum/",
  "notes": "Used hash map approach"
}
```

#### Get All Questions
```http
GET /api/questions?filter=pending&sortBy=newest
Authorization: Bearer <token>
```

#### Mark as Revised
```http
PUT /api/questions/:id/revise
Authorization: Bearer <token>
```

#### Delete Question
```http
DELETE /api/questions/:id
Authorization: Bearer <token>
```

#### Get Dashboard Stats
```http
GET /api/questions/stats/dashboard
Authorization: Bearer <token>
```

## 🔔 Reminder System

The application uses **node-cron** to check for due reminders daily at 8 AM. The cron job:
- Finds all questions with reminders due today or earlier
- Logs reminder notifications (can be extended to send emails/push notifications)
- Marks overdue questions

### Reminder Logic
- **First Reminder**: 7 days after adding the question
- **Second Reminder**: 30 days after adding the question
- Questions are marked as "Fully Revised" after both reminders are completed

## 🎯 How to Use

1. **Sign Up**: Create an account with username, email, and password
2. **Login**: Sign in to access your dashboard
3. **Add Questions**: 
   - Copy a LeetCode problem URL (e.g., `https://leetcode.com/problems/two-sum/`)
   - Or just paste the problem slug (e.g., `two-sum`)
   - Add optional notes about your solution approach
4. **Track Progress**: View your dashboard to see stats and upcoming reminders
5. **Revise**: When a reminder is due, click "Mark as Revised" after reviewing the problem
6. **Filter & Sort**: Use filters to focus on pending, due soon, or overdue questions

## 🌐 Production Deployment

### 🚀 Quick Deploy (30 minutes)

Deploy AlgoTick to production for **FREE** using:
- **MongoDB Atlas** (Database) - Free tier
- **Render** (Backend API) - Free tier  
- **Vercel** (Frontend + Landing) - Free tier

**📘 Deployment Guides:**
- **Quick Start**: See [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) - Get live in 30 minutes
- **Detailed Guide**: See [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md) - Complete walkthrough
- **Checklist**: See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Pre-deployment tasks

### 📋 Deployment Overview

1. **MongoDB Atlas** - Create free cluster and get connection string
2. **Google OAuth** - Update with production URLs
3. **Render** - Deploy backend with environment variables
4. **Vercel** - Deploy frontend (2 separate projects for app + landing)
5. **Test** - Verify all features work in production

### 🔧 Environment Variables Needed

**Backend (Render):**
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
SESSION_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
FRONTEND_URL=https://your-app.vercel.app
LANDING_URL=https://your-landing.vercel.app
```

**Frontend (Vercel):**
```env
REACT_APP_API_URL=https://your-backend.onrender.com/api
REACT_APP_GOOGLE_CLIENT_ID=...
```

**Landing (Vercel):**
```env
VITE_APP_URL=https://your-app.vercel.app
```

**💡 Tip:** Use `.env.production.template` files in each directory as a reference.

## 🔒 Security Features

- Passwords hashed with bcryptjs
- JWT-based authentication
- Protected API routes
- CORS enabled
- Environment variables for sensitive data

## 🎨 Color Scheme

- **Primary**: Blue (#0ea5e9)
- **Easy**: Green
- **Medium**: Yellow
- **Hard**: Red
- **Success**: Green
- **Warning**: Yellow
- **Danger**: Red

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 Future Enhancements

- [ ] Email notifications for due reminders
- [ ] Push notifications
- [ ] Calendar view for reminders
- [ ] Problem notes with rich text editor
- [ ] Export data to CSV
- [ ] Dark mode
- [ ] Social features (share progress)
- [ ] Spaced repetition algorithm
- [ ] Mobile app (React Native)

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

Built with ❤️ using the MERN stack

## 🙏 Acknowledgments

- LeetCode for their public GraphQL API
- TailwindCSS for the amazing utility-first CSS framework
- The MERN stack community

---

**Happy Coding! 🚀**

Remember: Consistency is the key to mastering algorithms and data structures!
