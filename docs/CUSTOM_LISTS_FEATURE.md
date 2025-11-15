# Custom Lists Feature - Complete Guide

## Overview
The Custom Lists feature allows you to organize LeetCode questions into themed collections and easily add them to your daily schedule. Perfect for topic-based practice, interview preparation, or any custom grouping you want!

## Features

### ✨ Create Custom Lists
- Create multiple lists with custom names and descriptions
- Each list can contain unlimited questions
- Visual organization with sidebar navigation

### 📝 Manage Questions in Lists
- Add questions by:
  - Question number (e.g., "1")
  - LeetCode URL (e.g., "https://leetcode.com/problems/two-sum/")
  - Title slug (e.g., "two-sum")
- Automatically fetches:
  - Question title
  - Difficulty level
  - Topic tags
  - LeetCode URL
- Remove questions from list anytime

### ⚡ Quick Actions
- **Add single question to today**: Click the `+` button next to any question
- **Add all questions to today**: One-click button to add entire list to your schedule

### 🎯 Smart Integration
- Questions added to "today's due" appear in your Dashboard
- If question already tracked, just updates the reminder date
- If new question, creates full tracking with reminders (today, 1 week, 1 month)

## How to Use

### 1. Create a New List
1. Navigate to **Lists** page from navbar
2. Click **+ New** button
3. Enter list name (required) and description (optional)
4. Click **Create**

### 2. Add Questions to List
1. Select a list from the sidebar
2. Click **+ Add Question to List**
3. Enter question number, URL, or slug
4. Click **Add**
5. Question details are fetched automatically from LeetCode

### 3. Add Questions to Today's Schedule

**Option A: Add Single Question**
- Click the `+` button next to any question in the list
- Question is immediately added to today's due questions
- View it in Dashboard under "Due Today" filter

**Option B: Add All Questions**
- Click **Add All to Today** button (top right)
- Confirms with you before adding
- Shows summary: how many added, updated, or skipped

### 4. Manage Lists
- **View**: Click any list in sidebar to see details
- **Edit**: (Future feature - currently create new)
- **Delete**: Click 🗑️ icon on list card

### 5. Remove Questions
- Click 🗑️ icon on any question in the list
- Only removes from list, doesn't affect tracked questions

## Use Cases

### 📚 Topic-Based Practice
**Example**: "Binary Search Problems"
- Add all binary search questions
- Add to today when focusing on that topic
- Track progress separately in Dashboard

### 🎯 Interview Prep
**Example**: "Top 50 Amazon Questions"
- Curate company-specific questions
- Add batches to daily schedule
- Review before interviews

### 🔥 Challenge Lists
**Example**: "Hard Problems to Master"
- Collect difficult questions
- Add one at a time to avoid overwhelm
- Track mastery over time

### 📅 Weekly Themes
**Example**: "Week 1: Arrays & Strings"
- Organize study plan by weeks
- Add entire week's questions on Monday
- Follow structured learning path

## API Endpoints

### Lists Management
```
GET    /api/lists                    - Get all lists
POST   /api/lists                    - Create new list
GET    /api/lists/:id                - Get single list
PUT    /api/lists/:id                - Update list
DELETE /api/lists/:id                - Delete list
```

### Questions in Lists
```
POST   /api/lists/:id/add-question                - Add question to list
DELETE /api/lists/:id/questions/:questionNumber   - Remove question from list
```

### Add to Schedule
```
POST   /api/lists/:id/add-question-to-today      - Add single question to today
POST   /api/lists/:id/add-all-to-today           - Add all questions to today
```

## Backend Models

### List Schema
```javascript
{
  userId: ObjectId,           // User who owns the list
  name: String,               // List name (required)
  description: String,        // Optional description
  questions: [                // Array of question objects
    {
      questionNumber: String, // LeetCode question number
      title: String,          // Question title
      titleSlug: String,      // URL slug
      difficulty: String,     // Easy/Medium/Hard
      url: String,            // Full LeetCode URL
      tags: [String]          // Topic tags
    }
  ],
  color: String,              // Future: Custom color
  timestamps: true            // createdAt, updatedAt
}
```

## Frontend Components

### CustomLists Page (`/lists`)
**Location**: `frontend/src/pages/CustomLists.js`

**State Management**:
- `lists` - All user's lists
- `selectedList` - Currently viewing list details
- `showCreateForm` - Toggle create list form
- `showAddQuestionForm` - Toggle add question form

**Key Functions**:
- `fetchLists()` - Load all lists
- `handleCreateList()` - Create new list
- `handleSelectList()` - Load list details
- `handleAddQuestion()` - Add question to list
- `handleRemoveQuestion()` - Remove from list
- `handleAddQuestionToToday()` - Add single to schedule
- `handleAddAllToToday()` - Add all to schedule

## UI/UX Design

### Layout
- **Left Sidebar (1/3)**: List navigation and create form
- **Right Content (2/3)**: Selected list details and questions

### Color Scheme
- Consistent dark theme with glassmorphism
- Gradient buttons: Green (#61dca3) to Blue (#61b3dc)
- Difficulty colors:
  - Easy: Green (#61dca3)
  - Medium: Yellow (#F59E0B)
  - Hard: Red (#EF4444)

### Interactions
- Hover effects on all clickable elements
- Loading spinners for async operations
- Success/error messages with auto-dismiss (5s)
- Confirmation dialogs for destructive actions

## Success Messages

### Creating Lists
```
✅ "List created successfully!"
```

### Adding Questions
```
✅ "Question added to list!"
✅ "Question added to today's due!"
✅ "Added 5 new questions, updated 2 existing questions, skipped 1 already due today"
```

### Managing Lists
```
✅ "List deleted successfully"
✅ "Question removed from list"
```

## Error Handling

### Common Errors
```
❌ "List name is required"
❌ "Please enter a question number or URL"
❌ "Question already exists in this list"
❌ "List not found"
❌ "Failed to fetch question from LeetCode"
```

### Backend Validation
- List name required and trimmed
- Question data validated before adding
- User ownership verified on all operations
- Duplicate prevention (same question in list)

## Testing Guide

### Test Flow
1. **Create List**
   - Name: "Test List"
   - Description: "For testing"
   - ✅ Should appear in sidebar

2. **Add Questions**
   - Add by number: "1"
   - Add by URL: "https://leetcode.com/problems/two-sum/"
   - Add by slug: "add-two-numbers"
   - ✅ Should fetch and display all details

3. **Add Single to Today**
   - Click `+` on one question
   - ✅ Check Dashboard "Due Today" filter
   - ✅ Question should appear

4. **Add All to Today**
   - Click "Add All to Today"
   - ✅ Confirm dialog appears
   - ✅ Success message shows summary
   - ✅ Check Dashboard for all questions

5. **Remove Question**
   - Click 🗑️ on question
   - ✅ Removed from list
   - ✅ Still in Dashboard if already added

6. **Delete List**
   - Click 🗑️ on list card
   - ✅ Confirm dialog appears
   - ✅ List removed from sidebar

## Future Enhancements

### Planned Features
- [ ] Edit list name/description
- [ ] Reorder questions within list
- [ ] Duplicate list
- [ ] Share lists with other users
- [ ] Import/export lists (JSON)
- [ ] List templates (common patterns)
- [ ] Color coding for lists
- [ ] Filter/search within list
- [ ] Sort questions by difficulty
- [ ] Progress tracking per list

### Potential Improvements
- [ ] Drag-and-drop question ordering
- [ ] Bulk import from CSV
- [ ] List statistics (avg difficulty, tags breakdown)
- [ ] Recommended questions based on list theme
- [ ] Study plan generation from list

## Technical Details

### Dependencies
- **Backend**: Express, Mongoose, LeetCode GraphQL API
- **Frontend**: React, React Router, Axios, TailwindCSS

### Database Indexes
```javascript
// List model
listSchema.index({ userId: 1, createdAt: -1 });
```

### Authentication
- All endpoints protected with JWT middleware
- User ID from token ensures data isolation

### Performance
- Lists loaded once on page mount
- Selected list details fetched on demand
- Optimistic UI updates where possible

## Troubleshooting

### "Failed to add question"
- ✅ Check LeetCode URL is valid
- ✅ Ensure question exists on LeetCode
- ✅ Try using question number instead

### "Question already exists in this list"
- ✅ Question is already in the list
- ✅ Check if you meant to add it to today instead

### "List not found"
- ✅ Refresh the page
- ✅ List may have been deleted
- ✅ Check backend server is running

### Questions not appearing in Dashboard
- ✅ Check "Due Today" filter is selected
- ✅ Verify backend added successfully (check message)
- ✅ Refresh Dashboard page

## Files Modified/Created

### Backend
- ✅ `backend/models/List.js` - List data model
- ✅ `backend/routes/lists.js` - Lists API endpoints
- ✅ `backend/server.js` - Registered lists routes

### Frontend
- ✅ `frontend/src/pages/CustomLists.js` - Main Lists page
- ✅ `frontend/src/services/api.js` - Lists API functions
- ✅ `frontend/src/App.js` - Added /lists route
- ✅ `frontend/src/components/Navbar.js` - Added Lists link

## Summary

The Custom Lists feature provides a powerful way to organize your LeetCode practice:

✅ **Flexible Organization** - Group questions any way you want
✅ **Quick Scheduling** - Add questions to today with one click
✅ **Smart Integration** - Seamlessly works with existing Dashboard
✅ **Clean UI** - Dark theme with intuitive layout
✅ **Full CRUD** - Create, view, update, delete lists and questions

**Access it now**: Navigate to **Lists** in the navbar! 🚀
