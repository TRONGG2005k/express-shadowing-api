/**
 * Unit Tests - Teacher Module
 * Kiểm thử đầy đủ cho Teacher module (DTO, Repository, Service, Controller)
 */


// ============================================================================
// TEACHER DTO TESTS
// ============================================================================

describe('Teacher DTOs', () => {
    const {
        CreateTeacherDto,
        UpdateTeacherDto,
        TeacherQueryDto,
        TeacherIdParamDto
    } = require('../../../src/modules/teacher/dto/create-teacher.dto');

    describe('CreateTeacherDto', () => {
        test('should validate valid teacher data', () => {
            const validData = {
                full_name: 'Tran Thi B',
                bio: 'Giáo viên tiếng Anh'
            };

            const result = CreateTeacherDto.parse(validData);
            expect(result.full_name).toBe('Tran Thi B');
            expect(result.bio).toBe('Giáo viên tiếng Anh');
        });

        test('should accept teacher without optional bio', () => {
            const validData = { full_name: 'Tran Thi B' };
            const result = CreateTeacherDto.parse(validData);
            expect(result.full_name).toBe('Tran Thi B');
            expect(result.bio).toBeUndefined();
        });

        test('should reject empty full_name', () => {
            expect(() => CreateTeacherDto.parse({ full_name: '' })).toThrow();
        });

        test('should reject full_name exceeding 100 characters', () => {
            expect(() => CreateTeacherDto.parse({ full_name: 'A'.repeat(101) })).toThrow();
        });

        test('should reject bio exceeding 1000 characters', () => {
            expect(() => CreateTeacherDto.parse({
                full_name: 'Test',
                bio: 'B'.repeat(1001)
            })).toThrow();
        });
    });

    describe('UpdateTeacherDto', () => {
        test('should accept partial updates', () => {
            const result = UpdateTeacherDto.parse({ bio: 'Updated bio' });
            expect(result.bio).toBe('Updated bio');
        });

        test('should accept empty object', () => {
            const result = UpdateTeacherDto.parse({});
            expect(result).toEqual({});
        });
    });

    describe('TeacherQueryDto', () => {
        test('should use default values', () => {
            const result = TeacherQueryDto.parse({});
            expect(result.page).toBe(1);
            expect(result.limit).toBe(10);
            expect(result.sortBy).toBe('created_at');
            expect(result.order).toBe('desc');
        });

        test('should accept custom values', () => {
            const result = TeacherQueryDto.parse({
                page: '2',
                limit: '20',
                sortBy: 'full_name',
                order: 'asc'
            });
            expect(result.page).toBe(2);
            expect(result.limit).toBe(20);
        });

        test('should reject invalid sortBy', () => {
            expect(() => TeacherQueryDto.parse({ sortBy: 'invalid' })).toThrow();
        });
    });

    describe('TeacherIdParamDto', () => {
        test('should accept valid bigint ID', () => {
            const result = TeacherIdParamDto.parse({ id: '123' });
            expect(result.id).toBe(BigInt(123));
        });

        test('should reject invalid ID', () => {
            expect(() => TeacherIdParamDto.parse({ id: 'abc' })).toThrow();
            expect(() => TeacherIdParamDto.parse({ id: '-1' })).toThrow();
        });
    });
});

// ============================================================================
// TEACHER SERVICE TESTS (with mocked repository)
// ============================================================================

describe('TeacherService', () => {
    let teacherService;
    let teacherRepository;

    beforeEach(() => {
        jest.resetModules();
        jest.mock('../../../src/modules/teacher/repository/teacher.repository', () => ({
            findAll: jest.fn(),
            findById: jest.fn(),
            findClassesByTeacherId: jest.fn(),
            existsByName: jest.fn(),
            existsByNameExcludingId: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
            delete: jest.fn()
        }));

        teacherRepository = require('../../../src/modules/teacher/repository/teacher.repository');
        teacherService = require('../../../src/modules/teacher/service/teacher.service');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllTeachers', () => {
        test('should return paginated teachers', async () => {
            const mockResult = {
                data: [{ id: BigInt(1), full_name: 'Teacher A' }],
                pagination: { page: 1, limit: 10, totalCount: 1, totalPages: 1 }
            };
            teacherRepository.findAll.mockResolvedValue(mockResult);

            const result = await teacherService.getAllTeachers({});

            expect(result.data).toHaveLength(1);
            expect(teacherRepository.findAll).toHaveBeenCalled();
        });
    });

    describe('getTeacherById', () => {
        test('should return teacher by ID', async () => {
            const mockTeacher = { id: BigInt(1), full_name: 'Teacher A' };
            teacherRepository.findById.mockResolvedValue(mockTeacher);

            const result = await teacherService.getTeacherById('1');

            expect(result.full_name).toBe('Teacher A');
        });

        test('should throw error when not found', async () => {
            teacherRepository.findById.mockResolvedValue(null);

            await expect(teacherService.getTeacherById('999'))
                .rejects.toThrow();
        });
    });

    describe('createTeacher', () => {
        test('should create teacher successfully', async () => {
            teacherRepository.existsByName.mockResolvedValue(false);
            teacherRepository.create.mockResolvedValue({
                id: BigInt(1),
                full_name: 'New Teacher'
            });

            const result = await teacherService.createTeacher({
                full_name: 'New Teacher'
            });

            expect(result.full_name).toBe('New Teacher');
        });

        test('should throw error when teacher exists', async () => {
            teacherRepository.existsByName.mockResolvedValue(true);

            await expect(teacherService.createTeacher({
                full_name: 'Existing Teacher'
            })).rejects.toThrow();
        });
    });

    describe('updateTeacher', () => {
        test('should update teacher successfully', async () => {
            teacherRepository.findById.mockResolvedValue({
                id: BigInt(1),
                full_name: 'Old Name'
            });
            teacherRepository.existsByNameExcludingId.mockResolvedValue(false);
            teacherRepository.update.mockResolvedValue({
                id: BigInt(1),
                full_name: 'New Name'
            });

            const result = await teacherService.updateTeacher('1', {
                full_name: 'New Name'
            });

            expect(result.full_name).toBe('New Name');
        });
    });

    describe('softDeleteTeacher', () => {
        test('should soft delete teacher', async () => {
            teacherRepository.findById.mockResolvedValue({ id: BigInt(1) });
            teacherRepository.softDelete.mockResolvedValue({});

            const result = await teacherService.softDeleteTeacher('1');

            expect(result).toBe(true);
        });
    });

    describe('hardDeleteTeacher', () => {
        test('should hard delete teacher', async () => {
            teacherRepository.findById.mockResolvedValue({ id: BigInt(1) });
            teacherRepository.delete.mockResolvedValue({});

            const result = await teacherService.hardDeleteTeacher('1');

            expect(result).toBe(true);
        });
    });

    describe('getTeacherClasses', () => {
        test('should return teacher classes', async () => {
            teacherRepository.findById.mockResolvedValue({ id: BigInt(1) });
            teacherRepository.findClassesByTeacherId.mockResolvedValue([
                { id: BigInt(1), name: 'Class A' }
            ]);

            const result = await teacherService.getTeacherClasses('1');

            expect(result).toHaveLength(1);
        });
    });
});

// ============================================================================
// TEACHER CONTROLLER TESTS
// ============================================================================

describe('TeacherController', () => {
    let teacherController;
    let teacherService;
    let req, res, next;

    beforeEach(() => {
        jest.resetModules();
        jest.mock('../../../src/modules/teacher/service/teacher.service', () => ({
            getAllTeachers: jest.fn(),
            getTeacherById: jest.fn(),
            createTeacher: jest.fn(),
            updateTeacher: jest.fn(),
            softDeleteTeacher: jest.fn(),
            hardDeleteTeacher: jest.fn(),
            getTeacherClasses: jest.fn()
        }));

        jest.mock('../../../src/utils/logger', () => ({
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn()
        }));

        teacherService = require('../../../src/modules/teacher/service/teacher.service');
        teacherController = require('../../../src/modules/teacher/controller/teacher.controller');

        req = { body: {}, params: {}, query: {}, ip: '127.0.0.1' };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
        next = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getAll', () => {
        test('should return 200 with teachers list', async () => {
            teacherService.getAllTeachers.mockResolvedValue({
                data: [{ id: BigInt(1), full_name: 'Teacher A' }],
                pagination: { page: 1, limit: 10, totalCount: 1, totalPages: 1 }
            });

            await teacherController.getAll(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true
            }));
        });
    });

    describe('getById', () => {
        test('should return 200 with teacher data', async () => {
            req.params.id = '1';
            teacherService.getTeacherById.mockResolvedValue({
                id: BigInt(1),
                full_name: 'Teacher A'
            });

            await teacherController.getById(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('create', () => {
        test('should return 201 on create', async () => {
            req.body = { full_name: 'New Teacher' };
            teacherService.createTeacher.mockResolvedValue({ id: BigInt(1) });

            await teacherController.create(req, res, next);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Tạo giáo viên thành công'
            }));
        });
    });

    describe('update', () => {
        test('should return 200 on update', async () => {
            req.params.id = '1';
            req.body = { full_name: 'Updated' };
            teacherService.updateTeacher.mockResolvedValue({ id: BigInt(1) });

            await teacherController.update(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Cập nhật giáo viên thành công'
            }));
        });
    });

    describe('delete', () => {
        test('should return 200 on soft delete', async () => {
            req.params.id = '1';
            teacherService.softDeleteTeacher.mockResolvedValue(true);

            await teacherController.delete(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Xóa giáo viên thành công'
            }));
        });
    });

    describe('hardDelete', () => {
        test('should return 200 on hard delete', async () => {
            req.params.id = '1';
            teacherService.hardDeleteTeacher.mockResolvedValue(true);

            await teacherController.hardDelete(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Xóa giáo viên vĩnh viễn thành công'
            }));
        });
    });

    describe('getClasses', () => {
        test('should return 200 with teacher classes', async () => {
            req.params.id = '1';
            teacherService.getTeacherClasses.mockResolvedValue([
                { id: BigInt(1), name: 'Class A' }
            ]);

            await teacherController.getClasses(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
        });
    });
});