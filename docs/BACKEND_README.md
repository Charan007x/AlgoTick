# LeetCode Revision Tracker - Backend

Backend API for the LeetCode Revision Tracker application built with Node.js, Express, and MongoDB.

## Features

- JWT-based authentication
- LeetCode API integration to fetch problem details
- Automated reminder system (7 days and 30 days)
- Question tracking with revision status
- Dashboard statistics

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend directory:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/leetcode-tracker
JWT_SECRET=your_secure_secret_key_here
NODE_ENV=development
```

4. Make sure MongoDB is running on your system

5. Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Questions
- `POST /api/questions` - Add a new question (requires auth)
- `GET /api/questions` - Get all user's questions (requires auth)
- `GET /api/questions/:id` - Get single question (requires auth)
- `PUT /api/questions/:id` - Update question notes (requires auth)
- `PUT /api/questions/:id/revise` - Mark question as revised (requires auth)
- `DELETE /api/questions/:id` - Delete a question (requires auth)
- `GET /api/questions/stats/dashboard` - Get dashboard statistics (requires auth)

### Query Parameters for GET /api/questions
- `filter`: pending, revised, due-soon, overdue
- `sortBy`: oldest, difficulty, next-reminder

## Technologies

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing
- Node-cron for scheduled tasks
- Axios for LeetCode API calls

## Reminder System

The application runs a daily cron job at 8 AM to check for questions with due reminders. The cron schedule can be modified in `server.js`.

## Deployment

For production deployment:
1. Set `NODE_ENV=production` in your environment variables
2. Use a secure JWT secret
3. Update MONGODB_URI to your production database
4. Consider using a service like Render, Railway, or Heroku
