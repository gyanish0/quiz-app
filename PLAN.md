# Quiz Management System - Implementation Plan

## Assumptions
1. Single admin user (can be extended to multiple admins)
2. JWT-based authentication for admin access
3. No user authentication required for taking quizzes
4. Questions will be stored with their correct answers
5. All quiz attempts will be stored to track participation

## Scope
### MVP Features
- Admin Panel
  - Admin authentication
  - CRUD operations for quizzes
  - Multiple question types support (MCQ, True/False, Text)
  - Question management within quizzes
- Public Pages
  - List all available quizzes
  - Take quiz functionality
  - Display results after completion
  - Basic score calculation

### Future Enhancements (Not in current scope)
- User authentication for quiz takers
- Quiz categories/tags
- Time limits for quizzes
- Rich text formatting in questions
- Analytics dashboard
- Leaderboard

## Technical Architecture

### Database Schema (MongoDB)

```javascript
// Admin
{
  _id: ObjectId,
  username: String,
  password: String (hashed),
  createdAt: Date
}

// Quiz
{
  _id: ObjectId,
  title: String,
  description: String,
  createdAt: Date,
  updatedAt: Date,
  questions: [
    {
      _id: ObjectId,
      type: String (enum: ['MCQ', 'TRUE_FALSE', 'TEXT']),
      question: String,
      options: [String] (for MCQ),
      correctAnswer: String/Boolean,
      points: Number
    }
  ]
}

// QuizAttempt
{
  _id: ObjectId,
  quizId: ObjectId,
  answers: [
    {
      questionId: ObjectId,
      answer: String/Boolean
    }
  ],
  score: Number,
  maxScore: Number,
  submittedAt: Date
}
```

### API Routes

#### Admin APIs (Protected)
- POST /api/auth/login
- POST /api/quizzes
- GET /api/quizzes
- GET /api/quizzes/:id
- PUT /api/quizzes/:id
- DELETE /api/quizzes/:id

#### Public APIs
- GET /api/public/quizzes (list all quizzes)
- GET /api/public/quizzes/:id (get quiz details)
- POST /api/public/quizzes/:id/submit (submit quiz attempt)

### Frontend Routes
- /admin/login
- /admin/dashboard
- /admin/quizzes
- /admin/quizzes/new
- /admin/quizzes/[id]/edit
- / (public home - list quizzes)
- /quiz/[id] (take quiz)
- /quiz/[id]/results (show results)

## Tech Stack Details
- Next.js 14 with App Router
- MongoDB for database
- TailwindCSS for styling
- NextAuth.js for authentication
- Mongoose for database modeling
- React Hook Form for form handling
- Zod for validation

## Implementation Approach
1. Setup project structure and configurations
2. Implement database connection and models
3. Create admin authentication system
4. Build admin CRUD operations
5. Develop public quiz listing and attempt functionality
6. Add styling and UI improvements
7. Testing and bug fixes
8. Deployment