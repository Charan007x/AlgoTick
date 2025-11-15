# LeetCode Revision Tracker - Frontend

A React-based frontend for tracking and managing your LeetCode problem-solving journey with automated reminders.

## Features

- 🔐 User authentication (login/signup)
- ➕ Add LeetCode questions with automatic data fetching
- 📊 Dashboard with statistics and insights
- 🔍 Filter questions by status (pending, revised, due soon, overdue)
- 🎨 Beautiful UI with TailwindCSS
- 📱 Responsive design
- ⏰ Visual reminder indicators

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the frontend directory (optional):
```
REACT_APP_API_URL=http://localhost:5000/api
```

3. Start the development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

## Available Scripts

- `npm start` - Run the development server
- `npm build` - Build for production
- `npm test` - Run tests

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── AddQuestionForm.js
│   │   ├── Navbar.js
│   │   ├── PrivateRoute.js
│   │   ├── QuestionCard.js
│   │   └── StatsCard.js
│   ├── context/
│   │   └── AuthContext.js
│   ├── pages/
│   │   ├── Dashboard.js
│   │   ├── Login.js
│   │   └── Signup.js
│   ├── services/
│   │   └── api.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
└── tailwind.config.js
```

## Technologies Used

- React 18
- React Router v6
- TailwindCSS
- Axios
- Context API for state management

## Features Overview

### Dashboard
- View all your LeetCode questions
- Filter by status (All, Pending, Revised, Due Soon, Overdue)
- Sort by date added, difficulty, or next reminder
- Statistics cards showing total solved, revised, due today, and due this week
- Difficulty breakdown visualization

### Add Questions
- Simply paste a LeetCode URL or problem slug
- Automatically fetches problem details (title, difficulty, tags)
- Add optional notes for each question

### Question Management
- Mark questions as revised
- Delete questions
- View revision history and next reminder dates
- Color-coded difficulty badges
- Visual indicators for overdue reminders

## Deployment

### Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variable in Vercel dashboard:
```
REACT_APP_API_URL=your_backend_url
```

### Other Platforms

The app can also be deployed to:
- Netlify
- GitHub Pages
- AWS Amplify
- Any static hosting service

Just run `npm run build` and deploy the `build` folder.

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT
