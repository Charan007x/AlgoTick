# ✅ Complete Setup Checklist

Use this checklist to ensure everything is properly set up and working.

## 📋 Pre-Installation Checklist

- [ ] Node.js installed (v14 or higher)
  - Check: Run `node --version` in terminal
  - Download: https://nodejs.org/

- [ ] npm installed (comes with Node.js)
  - Check: Run `npm --version` in terminal

- [ ] MongoDB installed or MongoDB Atlas account
  - Local: https://www.mongodb.com/try/download/community
  - Cloud: https://www.mongodb.com/cloud/atlas

- [ ] Code editor installed (VS Code recommended)
  - Download: https://code.visualstudio.com/

- [ ] Git installed (optional, for version control)
  - Download: https://git-scm.com/

---

## 📦 Installation Checklist

### Backend Setup
- [ ] Navigate to backend directory (`cd backend`)
- [ ] Run `npm install`
- [ ] Verify all dependencies installed (check for errors)
- [ ] Copy `.env.example` to `.env`
- [ ] Update `.env` with your settings:
  - [ ] PORT (default: 5000)
  - [ ] MONGODB_URI (your database connection string)
  - [ ] JWT_SECRET (random secure string)
  - [ ] NODE_ENV (development or production)

### Frontend Setup
- [ ] Navigate to frontend directory (`cd frontend`)
- [ ] Run `npm install`
- [ ] Verify all dependencies installed (check for errors)
- [ ] Optional: Create `.env` file with `REACT_APP_API_URL`

---

## 🗄️ Database Checklist

- [ ] MongoDB service is running
  - Windows: `net start MongoDB`
  - macOS/Linux: `mongod`
  - Cloud: Check MongoDB Atlas dashboard

- [ ] Database connection string is correct in backend `.env`
- [ ] Database name is set (default: `leetcode-tracker`)
- [ ] Network access configured (if using MongoDB Atlas)
- [ ] Database user created with read/write permissions (if using MongoDB Atlas)

---

## 🚀 Running the Application Checklist

### Backend
- [ ] Open terminal in backend directory
- [ ] Run `npm run dev` or `npm start`
- [ ] Check for "MongoDB connected successfully" message
- [ ] Check for "Server is running on port 5000" message
- [ ] No error messages in console
- [ ] Test health endpoint: `http://localhost:5000/api/health`

### Frontend
- [ ] Open NEW terminal in frontend directory
- [ ] Run `npm start`
- [ ] Browser opens automatically at `http://localhost:3000`
- [ ] No compilation errors in terminal
- [ ] Page loads without errors
- [ ] Console has no critical errors (F12 to open DevTools)

---

## 🧪 Testing Checklist

### Authentication Flow
- [ ] Navigate to `http://localhost:3000`
- [ ] Redirects to login page
- [ ] Click "Sign up here" link
- [ ] Fill signup form with:
  - [ ] Username (min 3 characters)
  - [ ] Email (valid format)
  - [ ] Password (min 6 characters)
  - [ ] Confirm password (matches password)
- [ ] Click "Sign Up" button
- [ ] Redirects to dashboard on success
- [ ] Navbar shows username
- [ ] Statistics cards visible

### Adding Questions
- [ ] Find "Add New Question" section
- [ ] Copy a LeetCode URL (e.g., `https://leetcode.com/problems/two-sum/`)
- [ ] Paste in URL field
- [ ] Optional: Add notes
- [ ] Click "Add Question"
- [ ] Success message appears
- [ ] Question appears in list below
- [ ] Question card shows:
  - [ ] Title (linked to LeetCode)
  - [ ] Difficulty badge (color-coded)
  - [ ] Tags
  - [ ] Date added
  - [ ] Next reminder date
  - [ ] "Mark as Revised" button
  - [ ] "Delete" button

### Dashboard Features
- [ ] Statistics cards show correct numbers
- [ ] Difficulty breakdown displays
- [ ] Filter dropdown works:
  - [ ] All Questions
  - [ ] Pending
  - [ ] Revised
  - [ ] Due Soon
  - [ ] Overdue
- [ ] Sort dropdown works:
  - [ ] Newest First
  - [ ] Oldest First
  - [ ] Difficulty
  - [ ] Next Reminder
- [ ] Questions filter correctly
- [ ] Questions sort correctly

### Question Management
- [ ] Click "Mark as Revised" on a question
- [ ] Revision count increases
- [ ] Next reminder updates
- [ ] After 2 revisions, shows "Completed ✓"
- [ ] Click "Delete" button
- [ ] Confirmation dialog appears
- [ ] Question is removed from list
- [ ] Statistics update

### Logout
- [ ] Click "Logout" button in navbar
- [ ] Redirects to login page
- [ ] Cannot access dashboard without logging in
- [ ] Token removed from localStorage

### Login Again
- [ ] Enter email and password
- [ ] Click "Sign In"
- [ ] Redirects to dashboard
- [ ] Previous questions still visible
- [ ] All data persisted

---

## 🔧 Backend API Testing Checklist

Use Postman, Thunder Client, or curl:

- [ ] POST `/api/auth/signup` - Register works
- [ ] POST `/api/auth/login` - Login works
- [ ] GET `/api/auth/me` - Get user works (with token)
- [ ] POST `/api/questions` - Add question works (with token)
- [ ] GET `/api/questions` - Get all questions works (with token)
- [ ] GET `/api/questions?filter=pending` - Filter works
- [ ] PUT `/api/questions/:id/revise` - Mark revised works
- [ ] DELETE `/api/questions/:id` - Delete works
- [ ] GET `/api/questions/stats/dashboard` - Stats work

---

## 🎨 UI/UX Checklist

### Responsiveness
- [ ] Desktop view (1024px+) looks good
- [ ] Tablet view (768px-1023px) looks good
- [ ] Mobile view (320px-767px) looks good
- [ ] Navigation works on mobile
- [ ] Cards stack properly on mobile
- [ ] Forms are usable on mobile

### Visual Design
- [ ] Colors are consistent
- [ ] Fonts are readable
- [ ] Buttons have hover effects
- [ ] Loading states show properly
- [ ] Error messages are visible and styled
- [ ] Success messages are visible and styled
- [ ] Badges are color-coded correctly
- [ ] Icons/emojis display properly

### User Experience
- [ ] Loading indicators during API calls
- [ ] Error messages are helpful
- [ ] Success feedback is clear
- [ ] Forms validate input
- [ ] Buttons disable during loading
- [ ] Links open in new tabs (LeetCode URLs)
- [ ] No console errors in browser

---

## 🔐 Security Checklist

- [ ] Passwords are NOT visible in database (hashed)
- [ ] JWT secret is secure and not committed to git
- [ ] Environment variables in `.env` not in git
- [ ] CORS is configured
- [ ] Protected routes require authentication
- [ ] Invalid tokens are rejected
- [ ] SQL/NoSQL injection prevented (using Mongoose)
- [ ] XSS prevented (React escaping)

---

## 📁 File Structure Verification

Check that all files exist:

### Root Directory
- [ ] `README.md`
- [ ] `QUICKSTART.md`
- [ ] `PROJECT_SUMMARY.md`
- [ ] `ARCHITECTURE.md`
- [ ] `API_EXAMPLES.md`
- [ ] `setup.ps1`
- [ ] `package.json`
- [ ] `.gitignore`

### Backend Directory
- [ ] `backend/server.js`
- [ ] `backend/package.json`
- [ ] `backend/.env.example`
- [ ] `backend/.gitignore`
- [ ] `backend/README.md`
- [ ] `backend/middleware/auth.js`
- [ ] `backend/models/User.js`
- [ ] `backend/models/Question.js`
- [ ] `backend/routes/auth.js`
- [ ] `backend/routes/questions.js`
- [ ] `backend/services/leetcodeService.js`
- [ ] `backend/services/reminderService.js`

### Frontend Directory
- [ ] `frontend/package.json`
- [ ] `frontend/tailwind.config.js`
- [ ] `frontend/postcss.config.js`
- [ ] `frontend/.gitignore`
- [ ] `frontend/README.md`
- [ ] `frontend/public/index.html`
- [ ] `frontend/src/index.js`
- [ ] `frontend/src/index.css`
- [ ] `frontend/src/App.js`
- [ ] `frontend/src/context/AuthContext.js`
- [ ] `frontend/src/services/api.js`
- [ ] `frontend/src/pages/Login.js`
- [ ] `frontend/src/pages/Signup.js`
- [ ] `frontend/src/pages/Dashboard.js`
- [ ] `frontend/src/components/Navbar.js`
- [ ] `frontend/src/components/PrivateRoute.js`
- [ ] `frontend/src/components/StatsCard.js`
- [ ] `frontend/src/components/AddQuestionForm.js`
- [ ] `frontend/src/components/QuestionCard.js`

---

## 🐛 Common Issues Resolution

### Issue: MongoDB Connection Error
- [ ] Check MongoDB service is running
- [ ] Verify MONGODB_URI in `.env`
- [ ] Check MongoDB logs for errors
- [ ] Ensure port 27017 is not blocked
- [ ] If using Atlas, check network access settings

### Issue: Port Already in Use
- [ ] Change PORT in backend `.env`
- [ ] Kill process using the port
- [ ] Windows: `netstat -ano | findstr :5000`
- [ ] macOS/Linux: `lsof -ti:5000 | xargs kill`

### Issue: LeetCode API Not Working
- [ ] Check internet connection
- [ ] Try a different problem
- [ ] LeetCode API might be down (temporary)
- [ ] Check browser network tab for errors

### Issue: JWT Token Invalid
- [ ] Clear localStorage in browser
- [ ] Log out and log back in
- [ ] Check JWT_SECRET is set in backend
- [ ] Verify token format in Authorization header

### Issue: Frontend Build Errors
- [ ] Delete `node_modules` folder
- [ ] Delete `package-lock.json`
- [ ] Run `npm install` again
- [ ] Check for conflicting dependencies

### Issue: Tailwind Styles Not Working
- [ ] Check `tailwind.config.js` exists
- [ ] Check `postcss.config.js` exists
- [ ] Verify `@tailwind` directives in `index.css`
- [ ] Restart frontend dev server

---

## 🚢 Pre-Deployment Checklist

### Code Quality
- [ ] No console.log statements in production code
- [ ] All TODO comments addressed
- [ ] Code is commented where necessary
- [ ] No unused imports or variables
- [ ] Error handling is comprehensive

### Environment Variables
- [ ] All sensitive data in environment variables
- [ ] `.env` files NOT committed to git
- [ ] `.env.example` provided with dummy values
- [ ] Production environment variables configured

### Testing
- [ ] All features tested manually
- [ ] Edge cases considered
- [ ] Error scenarios tested
- [ ] Different screen sizes tested

### Documentation
- [ ] README is comprehensive
- [ ] API documentation is complete
- [ ] Setup instructions are clear
- [ ] Architecture is documented

### Security
- [ ] No exposed secrets
- [ ] Strong JWT secret in production
- [ ] HTTPS enabled (in production)
- [ ] CORS properly configured
- [ ] Rate limiting considered (for future)

---

## ✅ Final Verification

- [ ] Application runs without errors
- [ ] All features work as expected
- [ ] Code is clean and organized
- [ ] Documentation is complete
- [ ] Git repository is clean (if using git)
- [ ] Ready for deployment or presentation

---

## 🎉 Success Criteria

Your application is ready when:

✅ User can sign up and log in
✅ User can add LeetCode questions
✅ Questions display with correct information
✅ Reminders are calculated correctly
✅ Filters and sorting work properly
✅ Statistics are accurate
✅ UI is responsive and polished
✅ No console errors
✅ Database persists data correctly
✅ Authentication works properly

---

**Congratulations! Your LeetCode Revision Tracker is complete! 🎊**

---

## 📞 Need Help?

If you encounter issues:
1. Check this checklist again
2. Review error messages carefully
3. Check the documentation files
4. Verify all dependencies are installed
5. Ensure MongoDB is running
6. Check browser console for errors
7. Check backend terminal for errors

---

**Happy Coding! 🚀**
