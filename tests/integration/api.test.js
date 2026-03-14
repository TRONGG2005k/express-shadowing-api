/**
 * Integration Tests - API Endpoints
 * Kiểm thử tích hợp cho các API endpoints của 3 module
 */

const request = require('supertest');

// Mock Prisma trước khi import app
jest.mock('../../src/config/prisma', () => ({
    prisma: {
        student: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            count: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn()
        },
        teacher: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            count: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn()
        },
        renamedclass: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            count: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn()
        },
        student_class: {
            count: jest.fn(),
            create: jest.fn(),
            deleteMany: jest.fn(),
            findMany: jest.fn()
        }
    }
}));

const app = require('../../src/app');
const { prisma } = require('../../src/config/prisma');

describe('API Integration Tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    // =========================================================================
    // HEALTH CHECK
    // =========================================================================
    describe('Health Check', () => {
        test('GET /api/health should return OK', async () => {
            const response = await request(app)
                .get('/api/health')
                .expect(200);

            expect(response.body.status).toBe('OK');
        });

        test('GET /api/hello should return Hello World', async () => {
            const response = await request(app)
                .get('/api/hello')
                .expect(200);

            expect(response.body.message).toBe('Hello World!');
        });
    });

    // =========================================================================
    // STUDENT API
    // =========================================================================
    describe('Student API', () => {
        test('GET /api/students should return students list', async () => {
            const mockStudents = [
                { id: BigInt(1), full_name: 'Student A', phone: '0901234567' },
                { id: BigInt(2), full_name: 'Student B', phone: '0909876543' }
            ];

            prisma.student.count.mockResolvedValue(2);
            prisma.student.findMany.mockResolvedValue(mockStudents);

            const response = await request(app)
                .get('/api/students')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(2);
            expect(response.body.pagination).toBeDefined();
        });

        test('GET /api/students/:id should return student by ID', async () => {
            prisma.student.findUnique.mockResolvedValue({
                id: BigInt(1),
                full_name: 'Student A',
                phone: '0901234567',
                student_class: []
            });

            const response = await request(app)
                .get('/api/students/1')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.full_name).toBe('Student A');
        });

        test('POST /api/students should create new student', async () => {
            prisma.student.count.mockResolvedValue(0);
            prisma.student.create.mockResolvedValue({
                id: BigInt(1),
                full_name: 'New Student',
                phone: '0901234567',
                dob: new Date('2000-01-01'),
                student_class: []
            });

            const response = await request(app)
                .post('/api/students')
                .send({
                    full_name: 'New Student',
                    phone: '0901234567',
                    dob: '2000-01-01'
                })
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Tạo học sinh thành công');
        });

        test('POST /api/students should return 400 for invalid data', async () => {
            const response = await request(app)
                .post('/api/students')
                .send({ full_name: '' })
                .expect(400);

            expect(response.body.status).toBe(400);
        });

        test('PUT /api/students/:id should update student', async () => {
            prisma.student.findUnique
                .mockResolvedValueOnce({
                    id: BigInt(1),
                    full_name: 'Old Name',
                    phone: '0901234567',
                    dob: new Date('2000-01-01')
                })
                .mockResolvedValueOnce({
                    id: BigInt(1),
                    full_name: 'Updated Name',
                    phone: '0901234567',
                    dob: new Date('2000-01-01'),
                    student_class: []
                });
            prisma.student.count.mockResolvedValue(0);
            prisma.student.update.mockResolvedValue({
                id: BigInt(1),
                full_name: 'Updated Name',
                phone: '0901234567',
                dob: new Date('2000-01-01'),
                student_class: []
            });

            const response = await request(app)
                .put('/api/students/1')
                .send({ full_name: 'Updated Name' })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Cập nhật học sinh thành công');
        });

        test('DELETE /api/students/:id should soft delete student', async () => {
            prisma.student.findUnique.mockResolvedValue({
                id: BigInt(1),
                full_name: 'Student A'
            });
            prisma.student.update.mockResolvedValue({ id: BigInt(1) });

            const response = await request(app)
                .delete('/api/students/1')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Xóa học sinh thành công');
        });

        test('DELETE /api/students/:id/hard should hard delete student', async () => {
            prisma.student.findUnique.mockResolvedValue({
                id: BigInt(1),
                full_name: 'Student A'
            });
            prisma.student.delete.mockResolvedValue({ id: BigInt(1) });

            const response = await request(app)
                .delete('/api/students/1/hard')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Xóa học sinh vĩnh viễn thành công');
        });
    });

    // =========================================================================
    // TEACHER API
    // =========================================================================
    describe('Teacher API', () => {
        test('GET /api/teachers should return teachers list', async () => {
            prisma.teacher.count.mockResolvedValue(1);
            prisma.teacher.findMany.mockResolvedValue([
                { id: BigInt(1), full_name: 'Teacher A', bio: 'Bio', Renamedclass: [] }
            ]);

            const response = await request(app)
                .get('/api/teachers')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(1);
        });

        test('GET /api/teachers/:id should return teacher by ID', async () => {
            prisma.teacher.findUnique.mockResolvedValue({
                id: BigInt(1),
                full_name: 'Teacher A',
                bio: 'Bio',
                Renamedclass: []
            });

            const response = await request(app)
                .get('/api/teachers/1')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.full_name).toBe('Teacher A');
        });

        test('POST /api/teachers should create new teacher', async () => {
            prisma.teacher.count.mockResolvedValue(0);
            prisma.teacher.create.mockResolvedValue({
                id: BigInt(1),
                full_name: 'New Teacher',
                bio: 'Bio',
                Renamedclass: []
            });

            const response = await request(app)
                .post('/api/teachers')
                .send({ full_name: 'New Teacher', bio: 'Bio' })
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Tạo giáo viên thành công');
        });

        test('PUT /api/teachers/:id should update teacher', async () => {
            prisma.teacher.findUnique
                .mockResolvedValueOnce({
                    id: BigInt(1),
                    full_name: 'Old Name'
                })
                .mockResolvedValueOnce({
                    id: BigInt(1),
                    full_name: 'Updated Name',
                    Renamedclass: []
                });
            prisma.teacher.count.mockResolvedValue(0);
            prisma.teacher.update.mockResolvedValue({
                id: BigInt(1),
                full_name: 'Updated Name',
                Renamedclass: []
            });

            const response = await request(app)
                .put('/api/teachers/1')
                .send({ full_name: 'Updated Name' })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Cập nhật giáo viên thành công');
        });

        test('DELETE /api/teachers/:id should soft delete teacher', async () => {
            prisma.teacher.findUnique.mockResolvedValue({ id: BigInt(1) });
            prisma.teacher.update.mockResolvedValue({ id: BigInt(1) });

            const response = await request(app)
                .delete('/api/teachers/1')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Xóa giáo viên thành công');
        });

        test('GET /api/teachers/:id/classes should return teacher classes', async () => {
            prisma.teacher.findUnique.mockResolvedValue({ id: BigInt(1) });
            prisma.renamedclass.findMany.mockResolvedValue([
                { id: BigInt(1), name: 'Class A', teacher: { id: BigInt(1), full_name: 'Teacher' } }
            ]);

            const response = await request(app)
                .get('/api/teachers/1/classes')
                .expect(200);

            expect(response.body.success).toBe(true);
        });
    });

    // =========================================================================
    // CLASS API
    // =========================================================================
    describe('Class API', () => {
        test('GET /api/classes should return classes list', async () => {
            prisma.renamedclass.count.mockResolvedValue(1);
            prisma.renamedclass.findMany.mockResolvedValue([
                {
                    id: BigInt(1),
                    name: 'Class A',
                    teacher: { id: BigInt(1), full_name: 'Teacher' },
                    _count: { student_class: 5, assignment_class: 2 }
                }
            ]);

            const response = await request(app)
                .get('/api/classes')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(1);
        });

        test('GET /api/classes/:id should return class by ID', async () => {
            prisma.renamedclass.findUnique.mockResolvedValue({
                id: BigInt(1),
                name: 'Class A',
                teacher: { id: BigInt(1), full_name: 'Teacher' },
                student_class: [],
                assignment_class: []
            });

            const response = await request(app)
                .get('/api/classes/1')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe('Class A');
        });

        test('POST /api/classes should create new class', async () => {
            prisma.renamedclass.count.mockResolvedValue(0);
            prisma.teacher.count.mockResolvedValue(1);
            prisma.renamedclass.create.mockResolvedValue({
                id: BigInt(1),
                name: 'New Class',
                teacher_id: BigInt(1),
                teacher: { id: BigInt(1), full_name: 'Teacher' },
                _count: { student_class: 0, assignment_class: 0 }
            });

            const response = await request(app)
                .post('/api/classes')
                .send({ name: 'New Class', teacher_id: '1' })
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Tạo lớp học thành công');
        });

        test('PUT /api/classes/:id should update class', async () => {
            prisma.renamedclass.findUnique
                .mockResolvedValueOnce({
                    id: BigInt(1),
                    name: 'Old Name'
                })
                .mockResolvedValueOnce({
                    id: BigInt(1),
                    name: 'Updated Name',
                    teacher: { id: BigInt(1), full_name: 'Teacher' }
                });
            prisma.renamedclass.count.mockResolvedValue(0);
            prisma.renamedclass.update.mockResolvedValue({
                id: BigInt(1),
                name: 'Updated Name',
                teacher: { id: BigInt(1), full_name: 'Teacher' }
            });

            const response = await request(app)
                .put('/api/classes/1')
                .send({ name: 'Updated Name' })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Cập nhật lớp học thành công');
        });

        test('DELETE /api/classes/:id should soft delete class', async () => {
            prisma.renamedclass.findUnique.mockResolvedValue({ id: BigInt(1) });
            prisma.renamedclass.update.mockResolvedValue({ id: BigInt(1) });

            const response = await request(app)
                .delete('/api/classes/1')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Xóa lớp học thành công');
        });

        test('GET /api/classes/:id/students should return students in class', async () => {
            prisma.renamedclass.findUnique.mockResolvedValue({ id: BigInt(1) });
            prisma.student.count.mockResolvedValue(2);
            prisma.student.findMany.mockResolvedValue([
                { id: BigInt(1), full_name: 'Student A', student_class: [{ joined_at: new Date() }] }
            ]);

            const response = await request(app)
                .get('/api/classes/1/students')
                .expect(200);

            expect(response.body.success).toBe(true);
        });

        test('POST /api/classes/:id/students should add student to class', async () => {
            prisma.renamedclass.findUnique.mockResolvedValue({ id: BigInt(1) });
            prisma.student.count.mockResolvedValue(1);
            prisma.student_class.count.mockResolvedValue(0);
            prisma.student_class.create.mockResolvedValue({
                student_id: BigInt(2),
                class_id: BigInt(1),
                student: { id: BigInt(2), full_name: 'Student' }
            });

            const response = await request(app)
                .post('/api/classes/1/students')
                .send({ student_id: '2' })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Thêm học sinh vào lớp thành công');
        });

        test('DELETE /api/classes/:id/students/:studentId should remove student', async () => {
            prisma.renamedclass.findUnique.mockResolvedValue({ id: BigInt(1) });
            prisma.student_class.deleteMany.mockResolvedValue({ count: 1 });

            const response = await request(app)
                .delete('/api/classes/1/students/2')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Xóa học sinh khỏi lớp thành công');
        });
    });

    // =========================================================================
    // ERROR HANDLING
    // =========================================================================
    describe('Error Handling', () => {
        test('should return 404 for non-existent route', async () => {
            const response = await request(app)
                .get('/api/non-existent-route')
                .expect(404);

            expect(response.body.message).toBe('Route not found');
        });

        test('should return 400 for invalid student ID format', async () => {
            const response = await request(app)
                .get('/api/students/invalid-id')
                .expect(400);

            expect(response.body.status).toBe(400);
        });
    });
});