/**
 * Unit Tests - Student Controller
 * Kiểm thử tầng Controller cho Student module
 */

// Mock service và logger trước khi import controller
jest.mock('../../../src/modules/student/service/student.service', () => ({
    getAllStudents: jest.fn(),
    getStudentById: jest.fn(),
    createStudent: jest.fn(),
    updateStudent: jest.fn(),
    softDeleteStudent: jest.fn(),
    hardDeleteStudent: jest.fn(),
    addStudentToClass: jest.fn(),
    removeStudentFromClass: jest.fn()
}));

jest.mock('../../../src/utils/logger', () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
}));

const studentController = require('../../../src/modules/student/controller/student.controller');
const studentService = require('../../../src/modules/student/service/student.service');

describe('StudentController', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            body: {},
            params: {},
            query: {},
            ip: '127.0.0.1'
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        next = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getAll', () => {
        test('should return 200 with students list', async () => {
            const mockResult = {
                data: [{ id: BigInt(1), full_name: 'Student A' }],
                pagination: { page: 1, limit: 10, totalCount: 1, totalPages: 1 }
            };
            studentService.getAllStudents.mockResolvedValue(mockResult);

            await studentController.getAll(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                data: mockResult.data,
                pagination: mockResult.pagination
            }));
        });

        test('should pass query params to service', async () => {
            req.query = { page: '2', limit: '5', search: 'test' };
            studentService.getAllStudents.mockResolvedValue({
                data: [],
                pagination: { page: 2, limit: 5, totalCount: 0, totalPages: 0 }
            });

            await studentController.getAll(req, res, next);

            expect(studentService.getAllStudents).toHaveBeenCalledWith(req.query);
        });

        test('should call next with error on failure', async () => {
            const error = new Error('Database error');
            studentService.getAllStudents.mockRejectedValue(error);

            await studentController.getAll(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('getById', () => {
        test('should return 200 with student data', async () => {
            req.params.id = '1';
            const mockStudent = { id: BigInt(1), full_name: 'Student A' };
            studentService.getStudentById.mockResolvedValue(mockStudent);

            await studentController.getById(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockStudent
            });
        });

        test('should pass ID param to service', async () => {
            req.params.id = '123';
            studentService.getStudentById.mockResolvedValue({});

            await studentController.getById(req, res, next);

            expect(studentService.getStudentById).toHaveBeenCalledWith('123');
        });

        test('should call next with error on failure', async () => {
            req.params.id = '999';
            const error = new Error('Not found');
            studentService.getStudentById.mockRejectedValue(error);

            await studentController.getById(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('create', () => {
        test('should return 201 with created student', async () => {
            req.body = { full_name: 'New Student', phone: '0901234567' };
            const mockCreated = { id: BigInt(1), ...req.body };
            studentService.createStudent.mockResolvedValue(mockCreated);

            await studentController.create(req, res, next);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                message: 'Tạo học sinh thành công',
                data: mockCreated
            }));
        });

        test('should pass body to service', async () => {
            req.body = { full_name: 'Test' };
            studentService.createStudent.mockResolvedValue({ id: BigInt(1) });

            await studentController.create(req, res, next);

            expect(studentService.createStudent).toHaveBeenCalledWith(req.body);
        });

        test('should call next with error on failure', async () => {
            const error = new Error('Validation error');
            studentService.createStudent.mockRejectedValue(error);

            await studentController.create(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('update', () => {
        test('should return 200 with updated student', async () => {
            req.params.id = '1';
            req.body = { full_name: 'Updated Name' };
            const mockUpdated = { id: BigInt(1), full_name: 'Updated Name' };
            studentService.updateStudent.mockResolvedValue(mockUpdated);

            await studentController.update(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                message: 'Cập nhật học sinh thành công',
                data: mockUpdated
            }));
        });

        test('should pass id and body to service', async () => {
            req.params.id = '1';
            req.body = { full_name: 'Test' };
            studentService.updateStudent.mockResolvedValue({});

            await studentController.update(req, res, next);

            expect(studentService.updateStudent).toHaveBeenCalledWith('1', req.body);
        });

        test('should call next with error on failure', async () => {
            req.params.id = '999';
            const error = new Error('Not found');
            studentService.updateStudent.mockRejectedValue(error);

            await studentController.update(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('delete', () => {
        test('should return 200 on successful soft delete', async () => {
            req.params.id = '1';
            studentService.softDeleteStudent.mockResolvedValue(true);

            await studentController.delete(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                message: 'Xóa học sinh thành công'
            }));
        });

        test('should pass id to service', async () => {
            req.params.id = '1';
            studentService.softDeleteStudent.mockResolvedValue(true);

            await studentController.delete(req, res, next);

            expect(studentService.softDeleteStudent).toHaveBeenCalledWith('1');
        });

        test('should call next with error on failure', async () => {
            req.params.id = '999';
            const error = new Error('Not found');
            studentService.softDeleteStudent.mockRejectedValue(error);

            await studentController.delete(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('hardDelete', () => {
        test('should return 200 on successful hard delete', async () => {
            req.params.id = '1';
            studentService.hardDeleteStudent.mockResolvedValue(true);

            await studentController.hardDelete(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                message: 'Xóa học sinh vĩnh viễn thành công'
            }));
        });

        test('should call next with error on failure', async () => {
            req.params.id = '999';
            const error = new Error('Not found');
            studentService.hardDeleteStudent.mockRejectedValue(error);

            await studentController.hardDelete(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('addToClass', () => {
        test('should return 200 on successful add', async () => {
            req.params.id = '1';
            req.body = { class_id: '2' };
            const mockResult = { student_id: BigInt(1), class_id: BigInt(2) };
            studentService.addStudentToClass.mockResolvedValue(mockResult);

            await studentController.addToClass(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                message: 'Thêm học sinh vào lớp thành công',
                data: mockResult
            }));
        });

        test('should pass student id and class_id to service', async () => {
            req.params.id = '1';
            req.body = { class_id: '2' };
            studentService.addStudentToClass.mockResolvedValue({});

            await studentController.addToClass(req, res, next);

            expect(studentService.addStudentToClass).toHaveBeenCalledWith('1', '2');
        });

        test('should call next with error on failure', async () => {
            req.params.id = '1';
            req.body = { class_id: '999' };
            const error = new Error('Class not found');
            studentService.addStudentToClass.mockRejectedValue(error);

            await studentController.addToClass(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('removeFromClass', () => {
        test('should return 200 on successful remove', async () => {
            req.params.id = '1';
            req.params.classId = '2';
            studentService.removeStudentFromClass.mockResolvedValue({ count: 1 });

            await studentController.removeFromClass(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                message: 'Xóa học sinh khỏi lớp thành công'
            }));
        });

        test('should pass student id and class id to service', async () => {
            req.params.id = '1';
            req.params.classId = '2';
            studentService.removeStudentFromClass.mockResolvedValue({ count: 1 });

            await studentController.removeFromClass(req, res, next);

            expect(studentService.removeStudentFromClass).toHaveBeenCalledWith('1', '2');
        });

        test('should call next with error on failure', async () => {
            req.params.id = '1';
            req.params.classId = '999';
            const error = new Error('Student not in class');
            studentService.removeStudentFromClass.mockRejectedValue(error);

            await studentController.removeFromClass(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });
});