# LearnHub - English Shadowing API

An English shadowing application designed for English learning through interactive exercises including shadowing practice, fill-in-the-blank, vocabulary quizzes, and video responses.

## 📋 Project Overview

LearnHub is a comprehensive English learning platform that provides:

- **Shadowing Practice**: Listen and repeat audio exercises to improve pronunciation and fluency
- **Fill-in-the-Blank**: Complete sentences with correct words to test grammar and vocabulary
- **Vocabulary Quizzes**: Test knowledge of English words with multiple question types
- **Video Responses**: Record video answers for speaking practice
- **Text Answers**: Submit written responses for teacher grading
- **Assignment Management**: Teachers can create and assign exercises to classes
- **Progress Tracking**: Track student exercise completion and scores

## 🏗️ Database Architecture

![Entity Relationship Diagram](erd_.png)

### Core Entities

| Entity | Description |
|--------|-------------|
| `users` | System users (students, teachers, admins) with authentication |
| `student` | Student profiles with personal information |
| `teacher` | Teacher profiles with bio and teaching history |
| `Renamedclass` | Classes created by teachers to group students |
| `assignment` | Exercises created by teachers with due dates |
| `question` | Individual questions within assignments (various types) |
| `user_exercise` | Student attempts/submissions for assignments |
| `exercise_result` | Results for each question in an exercise |
| `vocabulary` | English words with definitions, examples, and media |
| `shadowing_detail` | Audio scripts for shadowing exercises |
| `fill_blank_detail` | Sentences with blanks for fill-in-the-blank questions |
| `shadowing_result` | Pronunciation and fluency scores for shadowing |
| `student_video` | Video recordings submitted by students |

### Question Types

- **fill_blank**: Complete sentences with missing words
- **vocabulary**: Word meaning and usage questions
- **shadowing**: Listen and repeat audio exercises
- **text_answer**: Written response questions
- **video_answer**: Video response questions

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations (if needed)
npx prisma migrate dev

# Start development server
npm run devStart
```

### Environment Variables

Create a `.env` file with the following variables:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/learnhub"
JWT_SECRET="your-jwt-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"
PORT=3000
```

## 📁 Project Structure

```
express-shadowing-api/
├── src/
│   ├── app.js                 # Express app configuration
│   ├── modules/               # Feature modules
│   │   ├── auth/              # Authentication module
│   │   ├── user/              # User management
│   │   ├── student/           # Student operations
│   │   ├── teacher/           # Teacher operations
│   │   ├── class/             # Class management
│   │   └── vocabulary/        # Vocabulary management
│   ├── config/                # Configuration files
│   ├── middleware/            # Express middleware
│   ├── error/                 # Error handling
│   └── utils/                 # Utility functions
├── prisma/
│   └── schema.prisma          # Database schema
├── tests/
│   ├── unit/                  # Unit tests
│   └── integration/           # Integration tests
├── server.js                  # Server entry point
└── README.md                  # This file
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Students
- `GET /api/students` - List all students
- `GET /api/students/:id` - Get student details
- `POST /api/students` - Create student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Teachers
- `GET /api/teachers` - List all teachers
- `GET /api/teachers/:id` - Get teacher details
- `POST /api/teachers` - Create teacher
- `PUT /api/teachers/:id` - Update teacher
- `DELETE /api/teachers/:id` - Delete teacher

### Classes
- `GET /api/classes` - List all classes
- `GET /api/classes/:id` - Get class details
- `POST /api/classes` - Create class
- `PUT /api/classes/:id` - Update class
- `DELETE /api/classes/:id` - Delete class
- `POST /api/classes/:id/students` - Add student to class

### Vocabulary
- `GET /api/vocabularies` - List all vocabulary
- `GET /api/vocabularies/:id` - Get vocabulary details
- `POST /api/vocabularies` - Create vocabulary entry
- `PUT /api/vocabularies/:id` - Update vocabulary
- `DELETE /api/vocabularies/:id` - Delete vocabulary

### Health Check
- `GET /api/health` - Server health status
- `GET /api/hello` - Test endpoint

## 🧪 Testing

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod
- **Logging**: Winston
- **Testing**: Jest + Supertest
- **Containerization**: Docker (optional)

## 🔐 Authentication Flow

1. User registers/logs in with phone number and password
2. Server issues access token (short-lived) and refresh token (long-lived)
3. Access token is used for authenticated requests
4. When access token expires, use refresh token to get new access token
5. Refresh tokens are stored in database for revocation capability

## 👥 User Roles

- **Admin**: Full system access
- **Teacher**: Create assignments, grade exercises, manage classes
- **Student**: Complete exercises, view progress, submit responses

## 📝 Assignment Types

| Type | Description |
|------|-------------|
| `fill_blank` | Grammar exercises with missing words |
| `vocabulary` | Word definition and usage tests |
| `shadowing` | Pronunciation practice with audio |
| `mixed` | Combination of different question types |

## 📊 Exercise Status

- `pending`: Exercise assigned but not started
- `in_progress`: Student is currently working on it
- `submitted`: Exercise completed, awaiting grading
- `graded`: Exercise has been graded by teacher

## 🐳 Docker Support

Build and run with Docker:

```bash
# Build image
docker build -t learnhub-api .

# Run container
docker run -p 3000:3000 --env-file .env learnhub-api
```

## 📄 License

ISC

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
