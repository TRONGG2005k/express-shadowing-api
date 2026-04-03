# BÁO CÁO API - HỆ THỐNG QUẢN LÝ HỌC TẬP

## Tổng quan hệ thống

**Base URL:** `/api`  
**Tổng số Domain:** 6 (Auth, User, Student, Teacher, Class, Vocabulary)  
**Tổng số API Endpoints:** ~45 APIs

---

## 1. DOMAIN: AUTHENTICATION (`/api/auth`)

Quản lý đăng ký, đăng nhập, token và phiên làm việc của ngườI dùng.

| # | Method | Endpoint | Domain | Input | Output | Chức năng |
|---|--------|----------|--------|-------|--------|-----------|
| 1 | POST | `/api/auth/register` | Auth | Body: `{username, phone, password, role}` | `{success, message, data: {user, accessToken}}` + Cookie refreshToken | Đăng ký tài khoản mới |
| 2 | POST | `/api/auth/login` | Auth | Body: `{phone, password}` | `{success, message, data: {user, accessToken}}` + Cookie refreshToken | Đăng nhập hệ thống |
| 3 | GET | `/api/auth/refresh` | Auth | Cookie: `refreshToken` | `{success, message, data: {user, accessToken}}` + Cookie refreshToken mới | Làm mới access token |
| 4 | POST | `/api/auth/logout` | Auth | Cookie: `refreshToken` hoặc Body: `{refreshToken}` | `{success, message}` | Đăng xuất |
| 5 | POST | `/api/auth/logout-all` | Auth | Header: `Authorization: Bearer <token>` | `{success, message, deletedTokens}` | Đăng xuất tất cả thiết bị |
| 6 | GET | `/api/auth/me` | Auth | Header: `Authorization: Bearer <token>` | `{success, data: user}` | Lấy thông tin user hiện tại |

### Chi tiết DTO Auth

**RegisterDto:**
```javascript
{
  username: string (1-100 ký tự),
  phone: string (1-20 ký tự, chỉ số),
  password: string (6-255 ký tự),
  role: enum['student', 'teacher', 'admin'] (default: 'student')
}
```

**LoginDto:**
```javascript
{
  phone: string (1-20 ký tự, chỉ số),
  password: string (1-255 ký tự)
}
```

---

## 2. DOMAIN: USER MANAGEMENT (`/api/users`)

Quản lý thông tin ngườI dùng hệ thống.

| # | Method | Endpoint | Domain | Input | Output | Chức năng |
|---|--------|----------|--------|-------|--------|-----------|
| 1 | GET | `/api/users` | User | Query: `{page, limit, search, role, is_active, sortBy, order}` | `{success, data: [], pagination}` | Lấy danh sách users có phân trang |
| 2 | GET | `/api/users/:id` | User | Param: `id` | `{success, data: user}` | Lấy chi tiết user theo ID |
| 3 | POST | `/api/users` | User | Body: `CreateUserDto` | `{success, message, data: user}` | Tạo user mới |
| 4 | PUT | `/api/users/:id` | User | Param: `id`, Body: `UpdateUserDto` | `{success, message, data: user}` | Cập nhật user |
| 5 | DELETE | `/api/users/:id` | User | Param: `id` | `{success, message}` | Xóa mềm user |
| 6 | DELETE | `/api/users/:id/hard` | User | Param: `id` | `{success, message}` | Xóa vĩnh viễn user |
| 7 | POST | `/api/users/with-ref` | User | Body: `CreateUserWithRefDto` | `{success, message, data: user}` | Tạo user với ref_id, ref_type bắt buộc |

### Chi tiết DTO User

**CreateUserDto:**
```javascript
{
  username: string (3-100 ký tự, chỉ a-zA-Z0-9_),
  phone: string (10-20 ký tự),
  password: string (6-255 ký tự),
  role: enum['admin', 'teacher', 'student'],
  ref_id: bigint (optional),
  ref_type: enum['student', 'teacher', 'admin'] (optional),
  is_active: boolean (default: true)
}
```

**CreateUserWithRefDto:** (giống CreateUserDto nhưng ref_id và ref_type bắt buộc)

**UserQueryDto (Query Params):**
```javascript
{
  page: number (default: 1),
  limit: number (default: 10, max: 100),
  search: string (optional),
  role: enum['admin', 'teacher', 'student'] (optional),
  is_active: boolean (optional),
  sortBy: enum['username', 'created_at', 'updated_at', 'role'] (default: 'created_at'),
  order: enum['asc', 'desc'] (default: 'desc')
}
```

---

## 3. DOMAIN: STUDENT MANAGEMENT (`/api/students`)

Quản lý thông tin học sinh.

| # | Method | Endpoint | Domain | Input | Output | Chức năng |
|---|--------|----------|--------|-------|--------|-----------|
| 1 | GET | `/api/students` | Student | Query: `{page, limit, search, classId, sortBy, order}` | `{success, data: [], pagination}` | Lấy danh sách học sinh |
| 2 | GET | `/api/students/:id` | Student | Param: `id` | `{success, data: student}` | Lấy chi tiết học sinh |
| 3 | POST | `/api/students` | Student | Body: `CreateStudentDto` | `{success, message, data: student}` | Tạo học sinh mới |
| 4 | PUT | `/api/students/:id` | Student | Param: `id`, Body: `UpdateStudentDto` | `{success, message, data: student}` | Cập nhật học sinh |
| 5 | DELETE | `/api/students/:id` | Student | Param: `id` | `{success, message}` | Xóa mềm học sinh |
| 6 | DELETE | `/api/students/:id/hard` | Student | Param: `id` | `{success, message}` | Xóa vĩnh viễn học sinh |
| 7 | POST | `/api/students/:id/classes` | Student | Param: `id`, Body: `{class_id}` | `{success, message, data}` | Thêm học sinh vào lớp |
| 8 | DELETE | `/api/students/:id/classes/:classId` | Student | Param: `id`, `classId` | `{success, message}` | Xóa học sinh khỏi lớp |

### Chi tiết DTO Student

**CreateStudentDto:**
```javascript
{
  full_name: string (1-100 ký tự),
  phone: string (max: 20, optional, nullable),
  dob: date (optional, nullable, phải trong quá khứ)
}
```

**StudentQueryDto:**
```javascript
{
  page: number (default: 1),
  limit: number (default: 10, max: 100),
  search: string (optional),
  classId: bigint (optional),
  sortBy: enum['full_name', 'created_at', 'updated_at', 'dob'] (default: 'created_at'),
  order: enum['asc', 'desc'] (default: 'desc')
}
```

---

## 4. DOMAIN: TEACHER MANAGEMENT (`/api/teachers`)

Quản lý thông tin giáo viên.

| # | Method | Endpoint | Domain | Input | Output | Chức năng |
|---|--------|----------|--------|-------|--------|-----------|
| 1 | GET | `/api/teachers` | Teacher | Query: `{page, limit, search, sortBy, order}` | `{success, data: [], pagination}` | Lấy danh sách giáo viên |
| 2 | GET | `/api/teachers/:id` | Teacher | Param: `id` | `{success, data: teacher}` | Lấy chi tiết giáo viên |
| 3 | POST | `/api/teachers` | Teacher | Body: `CreateTeacherDto` | `{success, message, data: teacher}` | Tạo giáo viên mới |
| 4 | PUT | `/api/teachers/:id` | Teacher | Param: `id`, Body: `UpdateTeacherDto` | `{success, message, data: teacher}` | Cập nhật giáo viên |
| 5 | DELETE | `/api/teachers/:id` | Teacher | Param: `id` | `{success, message}` | Xóa mềm giáo viên |
| 6 | DELETE | `/api/teachers/:id/hard` | Teacher | Param: `id` | `{success, message}` | Xóa vĩnh viễn giáo viên |
| 7 | GET | `/api/teachers/:id/classes` | Teacher | Param: `id` | `{success, data: []}` | Lấy danh sách lớp của giáo viên |

### Chi tiết DTO Teacher

**CreateTeacherDto:**
```javascript
{
  full_name: string (1-100 ký tự),
  bio: string (max: 1000, optional, nullable)
}
```

**TeacherQueryDto:**
```javascript
{
  page: number (default: 1),
  limit: number (default: 10, max: 100),
  search: string (optional),
  sortBy: enum['full_name', 'created_at', 'updated_at'] (default: 'created_at'),
  order: enum['asc', 'desc'] (default: 'desc')
}
```

---

## 5. DOMAIN: CLASS MANAGEMENT (`/api/classes`)

Quản lý lớp học và học sinh trong lớp.

| # | Method | Endpoint | Domain | Input | Output | Chức năng |
|---|--------|----------|--------|-------|--------|-----------|
| 1 | GET | `/api/classes` | Class | Query: `{page, limit, search, teacher_id, sortBy, order}` | `{success, data: [], pagination}` | Lấy danh sách lớp học |
| 2 | GET | `/api/classes/:id` | Class | Param: `id` | `{success, data: class}` | Lấy chi tiết lớp học |
| 3 | POST | `/api/classes` | Class | Body: `CreateClassDto` | `{success, message, data: class}` | Tạo lớp học mới |
| 4 | PUT | `/api/classes/:id` | Class | Param: `id`, Body: `UpdateClassDto` | `{success, message, data: class}` | Cập nhật lớp học |
| 5 | DELETE | `/api/classes/:id` | Class | Param: `id` | `{success, message}` | Xóa mềm lớp học |
| 6 | DELETE | `/api/classes/:id/hard` | Class | Param: `id` | `{success, message}` | Xóa vĩnh viễn lớp học |
| 7 | GET | `/api/classes/:id/students` | Class | Param: `id`, Query: `{page, limit}` | `{success, data: [], pagination}` | Lấy danh sách học sinh trong lớp |
| 8 | POST | `/api/classes/:id/students` | Class | Param: `id`, Body: `{student_id}` | `{success, message, data}` | Thêm học sinh vào lớp |
| 9 | DELETE | `/api/classes/:id/students/:studentId` | Class | Param: `id`, `studentId` | `{success, message}` | Xóa học sinh khỏi lớp |

### Chi tiết DTO Class

**CreateClassDto:**
```javascript
{
  name: string (1-100 ký tự),
  description: string (max: 1000, optional, nullable),
  teacher_id: bigint (số dương)
}
```

**ClassQueryDto:**
```javascript
{
  page: number (default: 1),
  limit: number (default: 10, max: 100),
  search: string (optional),
  teacher_id: bigint (optional),
  sortBy: enum['name', 'created_at', 'updated_at'] (default: 'created_at'),
  order: enum['asc', 'desc'] (default: 'desc')
}
```

---

## 6. DOMAIN: VOCABULARY MANAGEMENT (`/api/vocabularies`)

Quản lý từ vựng, chủ đề và tìm kiếm từ điển.

| # | Method | Endpoint | Domain | Input | Output | Chức năng |
|---|--------|----------|--------|-------|--------|-----------|
| 1 | GET | `/api/vocabularies` | Vocabulary | Query: `{page, limit, search, type, topic, sortBy, order}` | `{success, data: [], pagination}` | Lấy danh sách từ vựng |
| 2 | GET | `/api/vocabularies/topics` | Vocabulary | - | `{success, data: []}` | Lấy danh sách chủ đề (topics) |
| 3 | GET | `/api/vocabularies/search` | Vocabulary | Query: `{word}` | `{success, data: vocabulary}` | Tìm kiếm từ vựng theo word |
| 4 | POST | `/api/vocabularies/batch` | Vocabulary | Body: `{items[], created_by}` | `{success, message, data}` | Tạo nhiều từ vựng cùng lúc |
| 5 | GET | `/api/vocabularies/:id` | Vocabulary | Param: `id` | `{success, data: vocabulary}` | Lấy chi tiết từ vựng |
| 6 | POST | `/api/vocabularies` | Vocabulary | Body: `CreateVocabularyDto` | `{success, message, data: vocabulary}` | Tạo từ vựng mới |
| 7 | PUT | `/api/vocabularies/:id` | Vocabulary | Param: `id`, Body: `UpdateVocabularyDto` | `{success, message, data: vocabulary}` | Cập nhật từ vựng |
| 8 | DELETE | `/api/vocabularies/:id` | Vocabulary | Param: `id` | `{success, message}` | Xóa mềm từ vựng |
| 9 | DELETE | `/api/vocabularies/:id/hard` | Vocabulary | Param: `id` | `{success, message}` | Xóa vĩnh viễn từ vựng |

### Chi tiết DTO Vocabulary

**CreateVocabularyDto:**
```javascript
{
  word: string (1-100 ký tự),
  type: enum['noun', 'verb', 'adjective', 'adverb', 'phrase'],
  topic: string (max: 100, optional, nullable),
  phonetic: string (max: 100, optional, nullable),
  meaning_vi: string (bắt buộc),
  explanation: string (optional, nullable),
  example_sentence: string (optional, nullable),
  example_translation: string (optional, nullable),
  audio_url: string (max: 500, URL, optional, nullable),
  image_url: string (max: 500, URL, optional, nullable),
  created_by: bigint (số dương)
}
```

**VocabularyQueryDto:**
```javascript
{
  page: number (default: 1),
  limit: number (default: 10, max: 100),
  search: string (optional),
  type: enum['noun', 'verb', 'adjective', 'adverb', 'phrase'] (optional),
  topic: string (optional),
  sortBy: enum['word', 'created_at', 'updated_at'] (default: 'created_at'),
  order: enum['asc', 'desc'] (default: 'desc')
}
```

---

## 7. HEALTH CHECK ENDPOINTS

| Method | Endpoint | Chức năng |
|--------|----------|-----------|
| GET | `/api/health` | Kiểm tra trạng thái server |
| GET | `/api/hello` | Test endpoint cơ bản |

---

## Tổng kết theo Domain

| Domain | Số API | Mô tả chính |
|--------|--------|-------------|
| Auth | 6 | Đăng ký, đăng nhập, token, logout |
| User | 7 | CRUD users, phân quyền |
| Student | 8 | CRUD học sinh, quản lý lớp học |
| Teacher | 7 | CRUD giáo viên, xem lớp |
| Class | 9 | CRUD lớp học, quản lý học sinh |
| Vocabulary | 9 | CRUD từ vựng, tìm kiếm, topics |
| **Tổng** | **46** | |

---

## Response Format Chuẩn

### Thành công (200, 201)
```json
{
  "success": true,
  "message": "Thông báo",
  "data": { ... }
}
```

### Phân trang
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalCount": 100,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Lỗi
```json
{
  "message": "Mô tả lỗi",
  "status": 400,
  "errorCode": "E99999",
  "errors": [ ... ] // Zod validation errors
}
```

---

## Security

- **Authentication:** JWT Bearer Token (access token)
- **Refresh Token:** HTTP Only Cookie
- **Validation:** Zod Schema Validation
- **Phân quyền:** Middleware auth (role-based)

## Công nghệ sử dụng

- **Framework:** Express.js
- **Database:** MySQL + Prisma ORM
- **Validation:** Zod
- **Testing:** Jest + Supertest
- **Logging:** Winston
