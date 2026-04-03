/**
 * Unit Tests - Class Module
 * Kiểm thử đầy đủ cho Class module (DTO, Repository, Service, Controller)
 */


// ============================================================================
// CLASS DTO TESTS
// ============================================================================

describe('Class DTOs', () => {
    const {
        CreateClassDto,
        UpdateClassDto,
        ClassQueryDto,
        ClassIdParamDto
    } = require('../../../src/modules/class/dto/create-class.dto');

    describe('CreateClassDto', () => {
        test('should validate valid class data', () => {
            const validData = {
                name: 'Lớp Tiếng Anh A1',
                description: 'Lớp học tiếng Anh cơ bản',
                teacher_id: '1'
            };

            const result = CreateClassDto.parse(validData);
            expect(result.name).toBe('Lớp Tiếng Anh A1');
            expect(result.description).toBe('Lớp học tiếng Anh cơ bản');
            expect(result.teacher_id).toBe(BigInt(1));
        });

        test('should accept class without optional description', () => {
            const validData = {
                name: 'Lớp Toán',
                teacher_id: '1'
            };
            const result = CreateClassDto.parse(validData);
            expect(result.name).toBe('Lớp Toán');
            expect(result.description).toBeUndefined();
        });

        test('should reject empty name', () => {
            expect(() => CreateClassDto.parse({
                name: '',
                teacher_id: '1'
            })).toThrow();
        });

        test('should reject name exceeding 100 characters', () => {
            expect(() => CreateClassDto.parse({
                name: 'A'.repeat(101),
                teacher_id: '1'
            })).toThrow();
        });

        test('should reject description exceeding 1000 characters', () => {
            expect(() => CreateClassDto.parse({
                name: 'Test',
                description: 'B'.repeat(1001),
                teacher_id: '1'
            })).toThrow();
        });

        test('should reject invalid teacher_id', () => {
            expect(() => CreateClassDto.parse({
                name: 'Test',
                teacher_id: 'abc'
            })).toThrow();
        });

        test('should reject negative teacher_id', () => {
            expect(() => CreateClassDto.parse({
                name: 'Test',
                teacher_id: '-1'
            })).toThrow();
        });
    });

    describe('UpdateClassDto', () => {
        test('should accept partial updates', () => {
            const result = UpdateClassDto.parse({ description: 'Updated' });
            expect(result.description).toBe('Updated');
        });

        test('should accept empty object', () => {
            const result = UpdateClassDto.parse({});
            expect(result).toEqual({});
        });
    });

    describe('ClassQueryDto', () => {
        test('should use default values', () => {
            const result = ClassQueryDto.parse({});
            expect(result.page).toBe(1);
            expect(result.limit).toBe(10);
            expect(result.sortBy).toBe('created_at');
            expect(result.order).toBe('desc');
        });

        test('should accept teacher_id filter', () => {
            const result = ClassQueryDto.parse({ teacher_id: '5' });
            expect(result.teacher_id).toBe(BigInt(5));
        });

        test('should accept custom values', () => {
            const result = ClassQueryDto.parse({
                page: '2',
                limit: '20',
                sortBy: 'name',
                order: 'asc'
            });
            expect(result.page).toBe(2);
            expect(result.limit).toBe(20);
            expect(result.sortBy).toBe('name');
        });

        test('should reject invalid sortBy', () => {
            expect(() => ClassQueryDto.parse({ sortBy: 'invalid' })).toThrow();
        });
    });

    describe('ClassIdParamDto', () => {
        test('should accept valid bigint ID', () => {
            const result = ClassIdParamDto.parse({ id: '123' });
            expect(result.id).toBe(BigInt(123));
        });

        test('should reject invalid ID', () => {
            expect(() => ClassIdParamDto.parse({ id: 'abc' })).toThrow();
            expect(() => ClassIdParamDto.parse({ id: '-1' })).toThrow();
            expect(() => ClassIdParamDto.parse({ id: '0' })).toThrow();
        });
    });
});

// ============================================================================
// CLASS SERVICE TESTS
// ============================================================================

describe('ClassService', () => {
    let classService;
    let classRepository;

    beforeEach(() => {
        jest.resetModules();
        jest.mock('../../../src/modules/class/repository/class.repository', () => ({
            findAll: jest.fn(),
            findById: jest.fn(),
            existsByName: jest.fn(),
            existsByNameExcludingId: jest.fn(),
            teacherExists: jest.fn(),
            isStudentInClass: jest.fn(),
            findStudentsByClassId: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
            delete: jest.fn(),
            addStudentToClass: jest.fn(),
            removeStudentFromClass: jest.fn()
        }));

        jest.mock('../../../src/config/prisma', () => ({
            prisma: {
                student: {
                    count: jest.fn()
                }
            }
        }));

        classRepository = require('../../../src/modules/class/repository/class.repository');
        classService = require('../../../src/modules/class/service/class.service');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllClasses', () => {
        test('should return paginated classes', async () => {
            const mockResult = {
                data: [{ id: BigInt(1), name: 'Class A' }],
                pagination: { page: 1, limit: 10, totalCount: 1, totalPages: 1 }
            };
            classRepository.findAll.mockResolvedValue(mockResult);

            const result = await classService.getAllClasses({});

            expect(result.data).toHaveLength(1);
        });

        test('should filter by teacher_id', async () => {
            classRepository.findAll.mockResolvedValue({
                data: [],
                pagination: { page: 1, limit: 10, totalCount: 0, totalPages: 0 }
            });

            await classService.getAllClasses({ teacher_id: '5' });

            expect(classRepository.findAll).toHaveBeenCalledWith(
                expect.objectContaining({ teacher_id: BigInt(5) })
            );
        });
    });

    describe('getClassById', () => {
        test('should return class by ID', async () => {
            const mockClass = { id: BigInt(1), name: 'Class A' };
            classRepository.findById.mockResolvedValue(mockClass);

            const result = await classService.getClassById('1');

            expect(result.name).toBe('Class A');
        });

        test('should throw error when not found', async () => {
            classRepository.findById.mockResolvedValue(null);

            await expect(classService.getClassById('999'))
                .rejects.toThrow();
        });
    });

    describe('createClass', () => {
        test('should create class successfully', async () => {
            classRepository.existsByName.mockResolvedValue(false);
            classRepository.teacherExists.mockResolvedValue(true);
            classRepository.create.mockResolvedValue({
                id: BigInt(1),
                name: 'New Class'
            });

            const result = await classService.createClass({
                name: 'New Class',
                teacher_id: '1'
            });

            expect(result.name).toBe('New Class');
        });

        test('should throw error when class name exists', async () => {
            classRepository.existsByName.mockResolvedValue(true);

            await expect(classService.createClass({
                name: 'Existing Class',
                teacher_id: '1'
            })).rejects.toThrow();
        });

        test('should throw error when teacher not found', async () => {
            classRepository.existsByName.mockResolvedValue(false);
            classRepository.teacherExists.mockResolvedValue(false);

            await expect(classService.createClass({
                name: 'New Class',
                teacher_id: '999'
            })).rejects.toThrow();
        });
    });

    describe('updateClass', () => {
        test('should update class successfully', async () => {
            classRepository.findById.mockResolvedValue({
                id: BigInt(1),
                name: 'Old Name'
            });
            classRepository.existsByNameExcludingId.mockResolvedValue(false);
            classRepository.update.mockResolvedValue({
                id: BigInt(1),
                name: 'New Name'
            });

            const result = await classService.updateClass('1', {
                name: 'New Name'
            });

            expect(result.name).toBe('New Name');
        });

        test('should check teacher existence when updating teacher_id', async () => {
            classRepository.findById.mockResolvedValue({
                id: BigInt(1),
                name: 'Class'
            });
            classRepository.existsByNameExcludingId.mockResolvedValue(false);
            classRepository.teacherExists.mockResolvedValue(false);

            await expect(classService.updateClass('1', {
                teacher_id: '999'
            })).rejects.toThrow();
        });
    });

    describe('softDeleteClass', () => {
        test('should soft delete class', async () => {
            classRepository.findById.mockResolvedValue({ id: BigInt(1) });
            classRepository.softDelete.mockResolvedValue({});

            const result = await classService.softDeleteClass('1');

            expect(result).toBe(true);
        });
    });

    describe('hardDeleteClass', () => {
        test('should hard delete class', async () => {
            classRepository.findById.mockResolvedValue({ id: BigInt(1) });
            classRepository.delete.mockResolvedValue({});

            const result = await classService.hardDeleteClass('1');

            expect(result).toBe(true);
        });
    });

    describe('getClassStudents', () => {
        test('should return students in class', async () => {
            classRepository.findById.mockResolvedValue({ id: BigInt(1) });
            classRepository.findStudentsByClassId.mockResolvedValue({
                data: [{ id: BigInt(1), full_name: 'Student A' }],
                pagination: { page: 1, limit: 10, totalCount: 1, totalPages: 1 }
            });

            const result = await classService.getClassStudents('1', {});

            expect(result.data).toHaveLength(1);
        });
    });

    describe('addStudentToClass', () => {
        test('should add student to class successfully', async () => {
            const { prisma } = require('../../../src/config/prisma');
            classRepository.findById.mockResolvedValue({ id: BigInt(1) });
            prisma.student.count.mockResolvedValue(1);
            classRepository.isStudentInClass.mockResolvedValue(false);
            classRepository.addStudentToClass.mockResolvedValue({
                student_id: BigInt(1),
                class_id: BigInt(2)
            });

            const result = await classService.addStudentToClass('2', '1');

            expect(result.student_id).toBe(BigInt(1));
        });

        test('should throw error when student already in class', async () => {
            const { prisma } = require('../../../src/config/prisma');
            classRepository.findById.mockResolvedValue({ id: BigInt(1) });
            prisma.student.count.mockResolvedValue(1);
            classRepository.isStudentInClass.mockResolvedValue(true);

            await expect(classService.addStudentToClass('1', '1'))
                .rejects.toThrow();
        });
    });

    describe('removeStudentFromClass', () => {
        test('should remove student from class', async () => {
            classRepository.findById.mockResolvedValue({ id: BigInt(1) });
            classRepository.removeStudentFromClass.mockResolvedValue({ count: 1 });

            const result = await classService.removeStudentFromClass('1', '2');

            expect(result.count).toBe(1);
        });

        test('should throw error when student not in class', async () => {
            classRepository.findById.mockResolvedValue({ id: BigInt(1) });
            classRepository.removeStudentFromClass.mockResolvedValue({ count: 0 });

            await expect(classService.removeStudentFromClass('1', '999'))
                .rejects.toThrow();
        });
    });
});

// ============================================================================
// CLASS CONTROLLER TESTS
// ============================================================================

describe('ClassController', () => {
    let classController;
    let classService;
    let req, res, next;

    beforeEach(() => {
        jest.resetModules();
        jest.mock('../../../src/modules/class/service/class.service', () => ({
            getAllClasses: jest.fn(),
            getClassById: jest.fn(),
            createClass: jest.fn(),
            updateClass: jest.fn(),
            softDeleteClass: jest.fn(),
            hardDeleteClass: jest.fn(),
            getClassStudents: jest.fn(),
            addStudentToClass: jest.fn(),
            removeStudentFromClass: jest.fn()
        }));

        jest.mock('../../../src/utils/logger', () => ({
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn()
        }));

        classService = require('../../../src/modules/class/service/class.service');
        classController = require('../../../src/modules/class/controller/class.controller');

        req = { body: {}, params: {}, query: {}, ip: '127.0.0.1' };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
        next = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getAll', () => {
        test('should return 200 with classes list', async () => {
            classService.getAllClasses.mockResolvedValue({
                data: [{ id: BigInt(1), name: 'Class A' }],
                pagination: { page: 1, limit: 10, totalCount: 1, totalPages: 1 }
            });

            await classController.getAll(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true
            }));
        });
    });

    describe('getById', () => {
        test('should return 200 with class data', async () => {
            req.params.id = '1';
            classService.getClassById.mockResolvedValue({ id: BigInt(1), name: 'Class A' });

            await classController.getById(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('create', () => {
        test('should return 201 on create', async () => {
            req.body = { name: 'New Class', teacher_id: '1' };
            classService.createClass.mockResolvedValue({ id: BigInt(1) });

            await classController.create(req, res, next);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Tạo lớp học thành công'
            }));
        });
    });

    describe('update', () => {
        test('should return 200 on update', async () => {
            req.params.id = '1';
            req.body = { name: 'Updated' };
            classService.updateClass.mockResolvedValue({ id: BigInt(1) });

            await classController.update(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Cập nhật lớp học thành công'
            }));
        });
    });

    describe('delete', () => {
        test('should return 200 on soft delete', async () => {
            req.params.id = '1';
            classService.softDeleteClass.mockResolvedValue(true);

            await classController.delete(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Xóa lớp học thành công'
            }));
        });
    });

    describe('hardDelete', () => {
        test('should return 200 on hard delete', async () => {
            req.params.id = '1';
            classService.hardDeleteClass.mockResolvedValue(true);

            await classController.hardDelete(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Xóa lớp học vĩnh viễn thành công'
            }));
        });
    });

    describe('getStudents', () => {
        test('should return 200 with students list', async () => {
            req.params.id = '1';
            classService.getClassStudents.mockResolvedValue({
                data: [{ id: BigInt(1), full_name: 'Student A' }],
                pagination: { page: 1, limit: 10, totalCount: 1, totalPages: 1 }
            });

            await classController.getStudents(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('addStudent', () => {
        test('should return 200 on add student', async () => {
            req.params.id = '1';
            req.body = { student_id: '2' };
            classService.addStudentToClass.mockResolvedValue({
                student_id: BigInt(2),
                class_id: BigInt(1)
            });

            await classController.addStudent(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Thêm học sinh vào lớp thành công'
            }));
        });
    });

    describe('removeStudent', () => {
        test('should return 200 on remove student', async () => {
            req.params.id = '1';
            req.params.studentId = '2';
            classService.removeStudentFromClass.mockResolvedValue({ count: 1 });

            await classController.removeStudent(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Xóa học sinh khỏi lớp thành công'
            }));
        });
    });
});