# 🚀 Quick Start Guide - LeetCode Revision Tracker

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** - [Download](https://www.mongodb.com/try/download/community)
- **npm** (comes with Node.js)

## Installation Methods

### Option 1: Automated Setup (Recommended for Windows)

1. Open PowerShell in the project directory
2. Run the setup script:
```powershell
.\setup.ps1
```

### Option 2: Manual Setup

#### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```

#### Step 2: Configure Backend Environment
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and update the following:
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/leetcode-tracker
# JWT_SECRET=your_secure_secret_key_here
# NODE_ENV=development
```

#### Step 3: Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

## Running the Application

### Start MongoDB (if running locally)

**Windows:**
```powershell
net start MongoDB
```

**macOS/Linux:**
```bash
mongod
```

### Start the Backend Server

Open a terminal and run:
```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:5000`

### Start the Frontend Server

Open a NEW terminal and run:
```bash
cd frontend
npm start
```

The frontend will open automatically at `http://localhost:3000`

## First-Time Usage

1. **Create an Account**
   - Open `http://localhost:3000`
   - Click "Sign up here"
   - Enter username, email, and password (min 6 characters)
   - Click "Sign Up"

2. **Add Your First Question**
   - Go to a LeetCode problem (e.g., https://leetcode.com/problems/two-sum/)
   - Copy the URL
   - Paste it in the "Add New Question" form
   - Optionally add notes about your approach
   - Click "Add Question"

3. **Track Your Progress**
   - View statistics on your dashboard
   - See upcoming reminders
   - Filter questions by status
   - Mark questions as revised when you review them

## Features Overview

### Dashboard Statistics
- **Total Solved**: All questions you've added
- **Fully Revised**: Questions you've reviewed both times
- **Due Today**: Questions that need revision today
- **Due This Week**: Upcoming revisions in the next 7 days

### Filters
- **All Questions**: View everything
- **Pending**: Questions not yet fully revised
- **Revised**: Questions you've completed all revisions for
- **Due Soon**: Questions due within 24 hours
- **Overdue**: Questions past their revision date

### Sorting Options
- **Newest First**: Recently added questions first
- **Oldest First**: Oldest questions first
- **Difficulty**: Sort by Easy → Medium → Hard
- **Next Reminder**: Sort by upcoming revision date

## Revision Schedule

When you add a question:
- **1st Reminder**: 7 days after adding
- **2nd Reminder**: 30 days after adding

After marking as revised twice, the question is marked as "Fully Revised" ✓

## Troubleshooting

### Backend won't start
- Ensure MongoDB is running
- Check if port 5000 is available
- Verify `.env` file exists and is configured correctly

### Frontend won't start
- Ensure port 3000 is available
- Try deleting `node_modules` and running `npm install` again

### Can't fetch LeetCode questions
- Check your internet connection
- LeetCode API might be temporarily unavailable
- Try again in a few minutes

### MongoDB connection error
- Ensure MongoDB service is running
- Check if the MONGODB_URI in `.env` is correct
- If using MongoDB Atlas, verify your connection string

## Environment Variables

### Backend (.env)
```env
PORT=5000                                              # Backend port
MONGODB_URI=mongodb://localhost:27017/leetcode-tracker # Database URI
JWT_SECRET=your_secure_secret_key_here                 # JWT secret key
NODE_ENV=development                                   # Environment mode
```

### Frontend (optional .env)
```env
REACT_APP_API_URL=http://localhost:5000/api  # Backend API URL
```

## Default Cron Schedule

The reminder checker runs daily at **8:00 AM**. You can modify this in `backend/server.js`:

```javascript
// Change the cron schedule (format: 'minute hour * * *')
cron.schedule('0 8 * * *', () => {
  // Runs every day at 8 AM
});
```

## API Testing

You can test the API using tools like Postman or Thunder Client:

1. **Register**: POST `http://localhost:5000/api/auth/signup`
2. **Login**: POST `http://localhost:5000/api/auth/login`
3. **Add Question**: POST `http://localhost:5000/api/questions` (with Bearer token)

## Production Deployment

### Backend (Render, Railway, or Heroku)
1. Create a new web service
2. Connect your repository
3. Set environment variables
4. Deploy

### Frontend (Vercel or Netlify)
1. Run `npm run build` in frontend directory
2. Deploy the `build` folder
3. Set `REACT_APP_API_URL` to your backend URL

### Database (MongoDB Atlas)
1. Create a free cluster
2. Get connection string
3. Update `MONGODB_URI` in backend environment

## Tips for Best Results

1. **Add questions immediately** after solving them
2. **Set aside time** for revisions when reminders are due
3. **Add detailed notes** about your approach and time complexity
4. **Review regularly** to reinforce concepts
5. **Use filters** to focus on overdue questions first

## Support

For issues or questions:
- Check the main README.md
- Review the API documentation
- Check backend and frontend README files

---

**Happy Learning! 🎉**

Remember: Spaced repetition is key to long-term retention!
