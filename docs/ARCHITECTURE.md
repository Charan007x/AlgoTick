# 🏗️ Architecture & Technical Documentation

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                        │
│                   (React + TailwindCSS)                      │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ HTTP/HTTPS
                      │ (Axios + JWT)
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                      API LAYER                               │
│                  (Express.js + CORS)                         │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Auth Routes  │  │   Question   │  │  Middleware  │     │
│  │              │  │    Routes    │  │   (JWT)      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ Mongoose ODM
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    DATABASE LAYER                            │
│                   (MongoDB)                                  │
│                                                              │
│  ┌──────────────┐         ┌──────────────┐                 │
│  │   Users      │         │  Questions   │                 │
│  │  Collection  │         │  Collection  │                 │
│  └──────────────┘         └──────────────┘                 │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  EXTERNAL SERVICES                           │
│                                                              │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │  LeetCode GraphQL    │  │   Node-Cron          │        │
│  │  API                 │  │   (Scheduler)        │        │
│  └──────────────────────┘  └──────────────────────┘        │
└──────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. User Authentication Flow
```
User → Login/Signup Form → API Request → Validate Credentials
                                       ↓
                            Generate JWT Token
                                       ↓
                        Store in localStorage
                                       ↓
                    Redirect to Dashboard
```

### 2. Add Question Flow
```
User → Paste LeetCode URL → Frontend Validation
                                    ↓
                        Extract Title Slug
                                    ↓
            API Request to Backend with Slug
                                    ↓
            Fetch from LeetCode GraphQL API
                                    ↓
            Parse Response (Title, Difficulty, Tags)
                                    ↓
            Calculate Reminder Dates (7d, 30d)
                                    ↓
                    Save to MongoDB
                                    ↓
                Return Question to Frontend
                                    ↓
                Update Dashboard UI
```

### 3. Reminder Check Flow
```
Cron Job (Daily 8 AM) → Query Questions with Due Reminders
                                    ↓
                    Filter by Date <= Today
                                    ↓
                    Log Reminders (Console)
                                    ↓
            [Future] Send Email/Push Notifications
```

## Database Schema

### User Schema
```javascript
{
  _id: ObjectId,
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  createdAt: Date (default: now)
}
```

### Question Schema
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  title: String (required),
  questionId: String (required),
  difficulty: String (enum: Easy/Medium/Hard),
  tags: [String],
  url: String,
  dateAdded: Date (default: now),
  nextReminders: [Date],           // [7 days, 30 days]
  revisedDates: [Date],            // Revision history
  isRevised: Boolean (default: false),
  revisionCount: Number (default: 0),
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints Reference

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | No | Register new user |
| POST | `/api/auth/login` | No | Login user |
| GET | `/api/auth/me` | Yes | Get current user |

### Questions
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/questions` | Yes | Add new question |
| GET | `/api/questions` | Yes | Get all user questions |
| GET | `/api/questions/:id` | Yes | Get single question |
| PUT | `/api/questions/:id` | Yes | Update question notes |
| PUT | `/api/questions/:id/revise` | Yes | Mark as revised |
| DELETE | `/api/questions/:id` | Yes | Delete question |
| GET | `/api/questions/stats/dashboard` | Yes | Get statistics |

### Query Parameters (GET /api/questions)
- `filter`: all, pending, revised, due-soon, overdue
- `sortBy`: newest, oldest, difficulty, next-reminder

## Component Hierarchy

```
App
├── AuthProvider (Context)
│
├── Router
│   ├── Login Page
│   │   └── Form Components
│   │
│   ├── Signup Page
│   │   └── Form Components
│   │
│   └── Dashboard (Protected)
│       ├── Navbar
│       ├── Stats Cards
│       │   ├── Total Solved
│       │   ├── Fully Revised
│       │   ├── Due Today
│       │   └── Due This Week
│       │
│       ├── Difficulty Breakdown
│       │
│       ├── Add Question Form
│       │   ├── URL Input
│       │   └── Notes Textarea
│       │
│       └── Questions List
│           ├── Filters & Sort
│           └── Question Cards
│               ├── Title & Link
│               ├── Difficulty Badge
│               ├── Tags
│               ├── Dates & Stats
│               ├── Notes
│               └── Action Buttons
```

## State Management

### Auth Context
```javascript
{
  user: {
    id: string,
    username: string,
    email: string
  },
  token: string,
  isAuthenticated: boolean,
  loading: boolean,
  login: function,
  signup: function,
  logout: function
}
```

### Dashboard State
```javascript
{
  questions: Array<Question>,
  stats: {
    totalSolved: number,
    totalRevised: number,
    pending: number,
    dueToday: number,
    dueThisWeek: number,
    difficulty: {
      Easy: number,
      Medium: number,
      Hard: number
    }
  },
  filter: string,
  sortBy: string,
  loading: boolean
}
```

## Security Measures

### Backend
- ✅ Password hashing with bcryptjs (salt rounds: 10)
- ✅ JWT token authentication (7-day expiry)
- ✅ Protected routes with auth middleware
- ✅ CORS enabled for cross-origin requests
- ✅ Environment variables for secrets
- ✅ Input validation on all endpoints
- ✅ MongoDB injection prevention (Mongoose)

### Frontend
- ✅ JWT stored in localStorage
- ✅ Token sent in Authorization header
- ✅ Private route protection
- ✅ Automatic logout on token expiry
- ✅ Form validation
- ✅ XSS prevention (React escaping)

## Performance Optimizations

### Backend
- Database indexing on userId and dateAdded
- Aggregation pipelines for statistics
- Efficient query filters
- Async/await for non-blocking operations

### Frontend
- React.memo for component optimization
- Conditional rendering
- Lazy loading (can be added)
- Debouncing on search (can be added)
- Image optimization (minimal images used)

## Error Handling

### Backend Errors
```javascript
try {
  // Operation
} catch (error) {
  console.error('Error:', error);
  res.status(500).json({ 
    message: 'Error message',
    error: process.env.NODE_ENV === 'development' ? error.message : {}
  });
}
```

### Frontend Errors
```javascript
try {
  // API call
} catch (error) {
  setError(error.response?.data?.message || 'Default error message');
}
```

## Reminder Algorithm

```javascript
// When adding a question
const dateAdded = new Date();

// Calculate reminders
const reminder1 = new Date(dateAdded);
reminder1.setDate(reminder1.getDate() + 7);  // 7 days

const reminder2 = new Date(dateAdded);
reminder2.setDate(reminder2.getDate() + 30); // 30 days

nextReminders = [reminder1, reminder2];

// When marking as revised
nextReminders.shift(); // Remove first reminder

if (nextReminders.length === 0) {
  isRevised = true; // Mark as fully revised
}
```

## LeetCode API Integration

### GraphQL Query
```graphql
query getQuestionDetail($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId
    title
    titleSlug
    difficulty
    topicTags {
      name
    }
  }
}
```

### API Endpoint
```
POST https://leetcode.com/graphql
Content-Type: application/json
```

## Cron Schedule Format
```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6)
│ │ │ │ │
* * * * *

Examples:
'0 8 * * *'   → Daily at 8:00 AM
'0 */6 * * *' → Every 6 hours
'0 0 * * 0'   → Every Sunday at midnight
```

## Environment Setup

### Development
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- Database: `mongodb://localhost:27017/leetcode-tracker`

### Production
- Frontend: Deployed on Vercel
- Backend: Deployed on Render
- Database: MongoDB Atlas

## Testing Strategy

### Backend Testing (Can be implemented)
- Unit tests for services
- Integration tests for API endpoints
- Database tests with test database

### Frontend Testing (Can be implemented)
- Component tests with React Testing Library
- Integration tests
- E2E tests with Cypress

## Monitoring & Logging

### Current Implementation
- Console logging for errors
- Cron job execution logs
- API request logging

### Recommendations
- Winston for structured logging
- Error tracking (Sentry)
- Performance monitoring (New Relic)
- Database query monitoring

## Scalability Considerations

### Current Limitations
- Single server deployment
- In-memory cron scheduling
- No caching layer

### Scaling Options
1. **Horizontal Scaling**: Multiple server instances with load balancer
2. **Database Sharding**: Distribute data across multiple MongoDB instances
3. **Caching**: Redis for frequently accessed data
4. **Message Queue**: Bull/RabbitMQ for background jobs
5. **Microservices**: Separate services for auth, questions, reminders

## Future Enhancements

### High Priority
- [ ] Email notifications (SendGrid/Mailgun)
- [ ] Push notifications (Firebase Cloud Messaging)
- [ ] Rich text editor for notes (Quill/TinyMCE)

### Medium Priority
- [ ] Calendar view for reminders
- [ ] Data export (CSV/JSON)
- [ ] Dark mode
- [ ] Problem difficulty statistics
- [ ] Study streak tracking

### Low Priority
- [ ] Social features (share progress)
- [ ] Collaboration features
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Custom reminder intervals

---

**This documentation provides a comprehensive overview of the application's architecture, design decisions, and implementation details.**
