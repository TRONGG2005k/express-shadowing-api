/**
 * Unit Tests - Student Service
 * Kiểm thử tầng Service cho Student module
 */

// Mock repository trước khi import service
jest.mock('../../../src/modules/student/repository/student.repository', () => ({
    findAll: jest.fn(),
    findByClass: jest.fn(),
    findById: jest.fn(),
    existsByNameAndDob: jest.fn(),
    existsByPhone: jest.fn(),
    existsByNameAndDobExcludingId: jest.fn(),
    existsByPhoneExcludingId: jest.fn(),
    classExists: jest.fn(),
    isStudentInClass: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    delete: jest.fn(),
    addToClass: jest.fn(),
    removeFromClass: jest.fn()
}));

const studentService = require('../../../src/modules/student/service/student.service');
const studentRepository = require('../../../src/modules/student/repository/student.repository');
const AppException = require('../../../src/error/exception/AppException');

describe('StudentService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllStudents', () => {
        test('should return all students with pagination', async () => {
            const mockResult = {
                data: [
                    { id: BigInt(1), full_name: 'Student A' },
                    { id: BigInt(2), full_name: 'Student B' }
                ],
                pagination: {
                    page: 1,
                    limit: 10,
                    totalCount: 2,
                    totalPages: 1
                }
            };

            studentRepository.findAll.mockResolvedValue(mockResult);

            const result = await studentService.getAllStudents({});

            expect(result.data).toHaveLength(2);
            expect(studentRepository.findAll).toHaveBeenCalled();
        });

        test('should filter by classId when provided', async () => {
            const mockResult = {
                data: [{ id: BigInt(1), full_name: 'Student A' }],
                pagination: { page: 1, limit: 10, totalCount: 1, totalPages: 1 }
            };

            studentRepository.findByClass.mockResolvedValue(mockResult);

            const result = await studentService.getAllStudents({ classId: '1' });

            expect(studentRepository.findByClass).toHaveBeenCalled();
            expect(studentRepository.findAll).not.toHaveBeenCalled();
        });

        test('should use default pagination values', async () => {
            studentRepository.findAll.mockResolvedValue({
                data: [],
                pagination: { page: 1, limit: 10, totalCount: 0, totalPages: 0 }
            });

            await studentService.getAllStudents({});

            expect(studentRepository.findAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    page: 1,
                    limit: 10,
                    sortBy: 'created_at',
                    order: 'desc'
                })
            );
        });

        test('should throw error for invalid query params', async () => {
            await expect(studentService.getAllStudents({ limit: 'invalid' }))
                .rejects.toThrow();
        });
    });

    describe('getStudentById', () => {
        test('should return student by ID', async () => {
            const mockStudent = {
                id: BigInt(1),
                full_name: 'Nguyen Van A',
                phone: '0901234567'
            };

            studentRepository.findById.mockResolvedValue(mockStudent);

            const result = await studentService.getStudentById('1');

            expect(result.full_name).toBe('Nguyen Van A');
            expect(studentRepository.findById).toHaveBeenCalledWith(BigInt(1));
        });

        test('should throw AppException when student not found', async () => {
            studentRepository.findById.mockResolvedValue(null);

            await expect(studentService.getStudentById('999'))
                .rejects.toThrow(AppException);
        });

        test('should throw error for invalid ID format', async () => {
            await expect(studentService.getStudentById('invalid'))
                .rejects.toThrow();
        });
    });

    describe('createStudent', () => {
        test('should create new student successfully', async () => {
            const mockCreatedStudent = {
                id: BigInt(1),
                full_name: 'Nguyen Van A',
                phone: '0901234567',
                dob: new Date('2000-01-01')
            };

            studentRepository.existsByNameAndDob.mockResolvedValue(false);
            studentRepository.existsByPhone.mockResolvedValue(false);
            studentRepository.create.mockResolvedValue(mockCreatedStudent);

            const result = await studentService.createStudent({
                full_name: 'Nguyen Van A',
                phone: '0901234567',
                dob: '2000-01-01'
            });

            expect(result.id).toBe(BigInt(1));
            expect(studentRepository.create).toHaveBeenCalled();
        });

        test('should throw error when student already exists', async () => {
            studentRepository.existsByNameAndDob.mockResolvedValue(true);

            await expect(studentService.createStudent({
                full_name: 'Existing Student',
                dob: '2000-01-01'
            })).rejects.toThrow(AppException);

            expect(studentRepository.create).not.toHaveBeenCalled();
        });

        test('should throw error when phone already exists', async () => {
            studentRepository.existsByNameAndDob.mockResolvedValue(false);
            studentRepository.existsByPhone.mockResolvedValue(true);

            await expect(studentService.createStudent({
                full_name: 'New Student',
                phone: '0901234567'
            })).rejects.toThrow(AppException);
        });

        test('should throw validation error for invalid data', async () => {
            await expect(studentService.createStudent({
                full_name: ''
            })).rejects.toThrow();
        });

        test('should create student without optional fields', async () => {
            studentRepository.existsByNameAndDob.mockResolvedValue(false);
            studentRepository.create.mockResolvedValue({
                id: BigInt(1),
                full_name: 'Minimal Student'
            });

            const result = await studentService.createStudent({
                full_name: 'Minimal Student'
            });

            expect(result.full_name).toBe('Minimal Student');
        });
    });

    describe('updateStudent', () => {
        test('should update student successfully', async () => {
            const existingStudent = {
                id: BigInt(1),
                full_name: 'Old Name',
                phone: '0901234567',
                dob: new Date('2000-01-01')
            };

            const updatedStudent = {
                ...existingStudent,
                full_name: 'New Name'
            };

            studentRepository.findById.mockResolvedValue(existingStudent);
            studentRepository.existsByNameAndDobExcludingId.mockResolvedValue(false);
            studentRepository.existsByPhoneExcludingId.mockResolvedValue(false);
            studentRepository.update.mockResolvedValue(updatedStudent);

            const result = await studentService.updateStudent('1', {
                full_name: 'New Name'
            });

            expect(result.full_name).toBe('New Name');
        });

        test('should throw error when student not found', async () => {
            studentRepository.findById.mockResolvedValue(null);

            await expect(studentService.updateStudent('999', {
                full_name: 'New Name'
            })).rejects.toThrow(AppException);
        });

        test('should check for duplicate when updating name or dob', async () => {
            const existingStudent = {
                id: BigInt(1),
                full_name: 'Old Name',
                dob: new Date('2000-01-01')
            };

            studentRepository.findById.mockResolvedValue(existingStudent);
            studentRepository.existsByNameAndDobExcludingId.mockResolvedValue(true);

            await expect(studentService.updateStudent('1', {
                full_name: 'Different Name'
            })).rejects.toThrow(AppException);
        });

        test('should check for duplicate phone when updating', async () => {
            const existingStudent = {
                id: BigInt(1),
                full_name: 'Name',
                phone: '0901234567'
            };

            studentRepository.findById.mockResolvedValue(existingStudent);
            studentRepository.existsByNameAndDobExcludingId.mockResolvedValue(false);
            studentRepository.existsByPhoneExcludingId.mockResolvedValue(true);

            await expect(studentService.updateStudent('1', {
                phone: '0909876543'
            })).rejects.toThrow(AppException);
        });

        test('should skip duplicate check if name and dob unchanged', async () => {
            const existingStudent = {
                id: BigInt(1),
                full_name: 'Same Name',
                dob: new Date('2000-01-01')
            };

            studentRepository.findById.mockResolvedValue(existingStudent);
            studentRepository.update.mockResolvedValue(existingStudent);

            await studentService.updateStudent('1', {
                full_name: 'Same Name',
                dob: '2000-01-01'
            });

            expect(studentRepository.existsByNameAndDobExcludingId).not.toHaveBeenCalled();
        });
    });

    describe('softDeleteStudent', () => {
        test('should soft delete student successfully', async () => {
            studentRepository.findById.mockResolvedValue({ id: BigInt(1) });
            studentRepository.softDelete.mockResolvedValue({ id: BigInt(1) });

            const result = await studentService.softDeleteStudent('1');

            expect(result).toBe(true);
            expect(studentRepository.softDelete).toHaveBeenCalledWith(BigInt(1));
        });

        test('should throw error when student not found', async () => {
            studentRepository.findById.mockResolvedValue(null);

            await expect(studentService.softDeleteStudent('999'))
                .rejects.toThrow(AppException);
        });
    });

    describe('hardDeleteStudent', () => {
        test('should hard delete student successfully', async () => {
            studentRepository.findById.mockResolvedValue({ id: BigInt(1) });
            studentRepository.delete.mockResolvedValue({ id: BigInt(1) });

            const result = await studentService.hardDeleteStudent('1');

            expect(result).toBe(true);
            expect(studentRepository.delete).toHaveBeenCalledWith(BigInt(1));
        });

        test('should throw error when student not found', async () => {
            studentRepository.findById.mockResolvedValue(null);

            await expect(studentService.hardDeleteStudent('999'))
                .rejects.toThrow(AppException);
        });
    });

    describe('addStudentToClass', () => {
        test('should add student to class successfully', async () => {
            studentRepository.findById.mockResolvedValue({ id: BigInt(1) });
            studentRepository.classExists.mockResolvedValue(true);
            studentRepository.isStudentInClass.mockResolvedValue(false);
            studentRepository.addToClass.mockResolvedValue({
                student_id: BigInt(1),
                class_id: BigInt(2)
            });

            const result = await studentService.addStudentToClass('1', '2');

            expect(result.student_id).toBe(BigInt(1));
            expect(studentRepository.addToClass).toHaveBeenCalledWith(BigInt(1), BigInt(2));
        });

        test('should throw error when student not found', async () => {
            studentRepository.findById.mockResolvedValue(null);

            await expect(studentService.addStudentToClass('999', '1'))
                .rejects.toThrow(AppException);
        });

        test('should throw error when class not found', async () => {
            studentRepository.findById.mockResolvedValue({ id: BigInt(1) });
            studentRepository.classExists.mockResolvedValue(false);

            await expect(studentService.addStudentToClass('1', '999'))
                .rejects.toThrow(AppException);
        });

        test('should throw error when student already in class', async () => {
            studentRepository.findById.mockResolvedValue({ id: BigInt(1) });
            studentRepository.classExists.mockResolvedValue(true);
            studentRepository.isStudentInClass.mockResolvedValue(true);

            await expect(studentService.addStudentToClass('1', '1'))
                .rejects.toThrow(AppException);
        });

        test('should throw error for invalid IDs', async () => {
            await expect(studentService.addStudentToClass('invalid', '1'))
                .rejects.toThrow();
        });
    });

    describe('removeStudentFromClass', () => {
        test('should remove student from class successfully', async () => {
            studentRepository.findById.mockResolvedValue({ id: BigInt(1) });
            studentRepository.removeFromClass.mockResolvedValue({ count: 1 });

            const result = await studentService.removeStudentFromClass('1', '2');

            expect(result.count).toBe(1);
        });

        test('should throw error when student not found', async () => {
            studentRepository.findById.mockResolvedValue(null);

            await expect(studentService.removeStudentFromClass('999', '1'))
                .rejects.toThrow(AppException);
        });

        test('should throw error when student not in class', async () => {
            studentRepository.findById.mockResolvedValue({ id: BigInt(1) });
            studentRepository.removeFromClass.mockResolvedValue({ count: 0 });

            await expect(studentService.removeStudentFromClass('1', '999'))
                .rejects.toThrow(AppException);
        });
    });
});