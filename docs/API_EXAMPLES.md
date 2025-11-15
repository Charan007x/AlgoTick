# 🧪 API Testing Examples

This file contains example API calls you can use to test the backend with tools like Postman, Thunder Client, or curl.

## Base URL
```
http://localhost:5000/api
```

---

## 🔐 Authentication Endpoints

### 1. Register New User

**POST** `/auth/signup`

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

---

### 2. Login User

**POST** `/auth/login`

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

---

### 3. Get Current User

**GET** `/auth/me`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "createdAt": "2025-10-16T10:00:00.000Z"
  }
}
```

---

## 📚 Question Endpoints (All require authentication)

### 1. Add New Question

**POST** `/questions`

**Headers:**
```
Authorization: Bearer <your_token>
Content-Type: application/json
```

**Body (Full URL):**
```json
{
  "url": "https://leetcode.com/problems/two-sum/",
  "notes": "Used hash map approach. Time: O(n), Space: O(n)"
}
```

**OR Body (Just Slug):**
```json
{
  "titleSlug": "two-sum",
  "notes": "Used hash map approach. Time: O(n), Space: O(n)"
}
```

**Response (201 Created):**
```json
{
  "message": "Question added successfully",
  "question": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "title": "Two Sum",
    "questionId": "1",
    "difficulty": "Easy",
    "tags": ["Array", "Hash Table"],
    "url": "https://leetcode.com/problems/two-sum/",
    "dateAdded": "2025-10-16T10:00:00.000Z",
    "nextReminders": [
      "2025-10-23T10:00:00.000Z",
      "2025-11-15T10:00:00.000Z"
    ],
    "revisedDates": [],
    "isRevised": false,
    "revisionCount": 0,
    "notes": "Used hash map approach. Time: O(n), Space: O(n)"
  }
}
```

---

### 2. Get All Questions

**GET** `/questions`

**Headers:**
```
Authorization: Bearer <your_token>
```

**Query Parameters (Optional):**
- `filter`: all | pending | revised | due-soon | overdue
- `sortBy`: newest | oldest | difficulty | next-reminder

**Examples:**
```
GET /questions
GET /questions?filter=pending
GET /questions?filter=due-soon&sortBy=next-reminder
GET /questions?filter=overdue
```

**Response (200 OK):**
```json
{
  "questions": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "userId": "507f1f77bcf86cd799439011",
      "title": "Two Sum",
      "questionId": "1",
      "difficulty": "Easy",
      "tags": ["Array", "Hash Table"],
      "url": "https://leetcode.com/problems/two-sum/",
      "dateAdded": "2025-10-16T10:00:00.000Z",
      "nextReminders": ["2025-10-23T10:00:00.000Z", "2025-11-15T10:00:00.000Z"],
      "revisedDates": [],
      "isRevised": false,
      "revisionCount": 0,
      "notes": "Used hash map approach"
    }
  ]
}
```

---

### 3. Get Single Question

**GET** `/questions/:id`

**Headers:**
```
Authorization: Bearer <your_token>
```

**Example:**
```
GET /questions/507f1f77bcf86cd799439012
```

**Response (200 OK):**
```json
{
  "question": {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Two Sum",
    "difficulty": "Easy",
    ...
  }
}
```

---

### 4. Update Question Notes

**PUT** `/questions/:id`

**Headers:**
```
Authorization: Bearer <your_token>
Content-Type: application/json
```

**Body:**
```json
{
  "notes": "Updated notes: Now using two-pointer approach"
}
```

**Response (200 OK):**
```json
{
  "message": "Question updated successfully",
  "question": {
    "_id": "507f1f77bcf86cd799439012",
    "notes": "Updated notes: Now using two-pointer approach",
    ...
  }
}
```

---

### 5. Mark Question as Revised

**PUT** `/questions/:id/revise`

**Headers:**
```
Authorization: Bearer <your_token>
```

**Response (200 OK):**
```json
{
  "message": "Question marked as revised",
  "question": {
    "_id": "507f1f77bcf86cd799439012",
    "revisionCount": 1,
    "revisedDates": ["2025-10-23T10:00:00.000Z"],
    "nextReminders": ["2025-11-15T10:00:00.000Z"],
    "isRevised": false
  }
}
```

---

### 6. Delete Question

**DELETE** `/questions/:id`

**Headers:**
```
Authorization: Bearer <your_token>
```

**Response (200 OK):**
```json
{
  "message": "Question deleted successfully"
}
```

---

### 7. Get Dashboard Statistics

**GET** `/questions/stats/dashboard`

**Headers:**
```
Authorization: Bearer <your_token>
```

**Response (200 OK):**
```json
{
  "totalSolved": 25,
  "totalRevised": 10,
  "pending": 15,
  "dueToday": 3,
  "dueThisWeek": 7,
  "difficulty": {
    "Easy": 10,
    "Medium": 12,
    "Hard": 3
  }
}
```

---

## 🧪 cURL Examples

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "test123"
  }'
```

### Login User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

### Add Question (Replace TOKEN)
```bash
curl -X POST http://localhost:5000/api/questions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://leetcode.com/problems/two-sum/",
    "notes": "Hash map solution"
  }'
```

### Get All Questions (Replace TOKEN)
```bash
curl -X GET http://localhost:5000/api/questions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Mark as Revised (Replace TOKEN and ID)
```bash
curl -X PUT http://localhost:5000/api/questions/YOUR_QUESTION_ID/revise \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🐛 Error Responses

### 400 Bad Request
```json
{
  "message": "Please provide all required fields"
}
```

### 401 Unauthorized
```json
{
  "message": "No token, authorization denied"
}
```

### 404 Not Found
```json
{
  "message": "Question not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Server error during operation",
  "error": "Detailed error message (in development mode)"
}
```

---

## 📝 Testing Workflow

### 1. Complete User Journey
```
1. POST /api/auth/signup        → Get token
2. POST /api/auth/login         → Verify login
3. GET /api/auth/me             → Check user info
4. POST /api/questions          → Add question
5. GET /api/questions           → View all questions
6. GET /api/questions/stats/dashboard → Check stats
7. PUT /api/questions/:id/revise → Mark revised
8. DELETE /api/questions/:id    → Delete question
```

### 2. Test Filters
```
GET /api/questions?filter=pending
GET /api/questions?filter=revised
GET /api/questions?filter=due-soon
GET /api/questions?filter=overdue
```

### 3. Test Sorting
```
GET /api/questions?sortBy=newest
GET /api/questions?sortBy=oldest
GET /api/questions?sortBy=difficulty
GET /api/questions?sortBy=next-reminder
```

---

## 🔧 Postman Collection

Import this JSON into Postman:

```json
{
  "info": {
    "name": "LeetCode Tracker API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000/api"
    },
    {
      "key": "token",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Signup",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/auth/signup",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"username\": \"testuser\",\n  \"email\": \"test@example.com\",\n  \"password\": \"test123\"\n}"
            }
          }
        }
      ]
    }
  ]
}
```

---

## ✅ Health Check

**GET** `/health`

No authentication required.

**Response:**
```json
{
  "status": "ok",
  "message": "LeetCode Tracker API is running",
  "timestamp": "2025-10-16T10:00:00.000Z"
}
```

---

**Happy Testing! 🧪**
