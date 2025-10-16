# 💡 LeetCode Revision Tracker

A full-stack MERN application to track your solved LeetCode problems and automatically remind you to revise them after 7 days and 30 days. Stay consistent with your coding practice!

## ✨ Features

### 🎯 Core Features
- **Smart Question Tracking**: Add LeetCode questions via URL or problem slug
- **Automated Reminders**: Get reminders after 7 days and 30 days
- **LeetCode API Integration**: Automatically fetch problem details (title, difficulty, tags)
- **Progress Dashboard**: Visual stats showing your progress and upcoming reviews
- **Intelligent Filtering**: Filter by pending, revised, due soon, or overdue
- **JWT Authentication**: Secure user authentication and authorization

### 📊 Dashboard Insights
- Total questions solved
- Questions fully revised
- Questions due today
- Questions due this week
- Difficulty breakdown (Easy/Medium/Hard)

### 🎨 UI/UX
- Beautiful, modern interface with TailwindCSS
- Responsive design for all devices
- Color-coded difficulty badges
- Visual reminder indicators
- Smooth animations and transitions

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **React Router v6** - Client-side routing
- **TailwindCSS** - Styling
- **Axios** - API calls
- **Context API** - State management

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **node-cron** - Scheduled tasks
- **Axios** - LeetCode API integration

## 📁 Project Structure

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

## 🌐 Deployment

### Backend Deployment (Render)

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Set the following:
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
4. Add environment variables in Render dashboard
5. Deploy!

### Frontend Deployment (Vercel)

1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to frontend directory: `cd frontend`
3. Run: `vercel`
4. Set environment variable: `REACT_APP_API_URL=your_backend_url`
5. Deploy!

### Database (MongoDB Atlas)

1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get your connection string
3. Update `MONGODB_URI` in your environment variables

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
