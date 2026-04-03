/**
 * Unit Tests - Student Repository
 * Kiểm thử tầng Repository cho Student module với Prisma mock
 */

// Mock Prisma trước khi import repository
jest.mock('../../../src/config/prisma', () => ({
    prisma: {
        student: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            count: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn()
        },
        renamedclass: {
            count: jest.fn()
        },
        student_class: {
            count: jest.fn(),
            create: jest.fn(),
            deleteMany: jest.fn()
        }
    }
}));

const studentRepository = require('../../../src/modules/student/repository/student.repository');
const { prisma } = require('../../../src/config/prisma');

describe('StudentRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        test('should return paginated students list', async () => {
            const mockStudents = [
                {
                    id: BigInt(1),
                    full_name: 'Nguyen Van A',
                    phone: '0901234567',
                    student_class: []
                },
                {
                    id: BigInt(2),
                    full_name: 'Tran Thi B',
                    phone: '0909876543',
                    student_class: []
                }
            ];

            prisma.student.count.mockResolvedValue(2);
            prisma.student.findMany.mockResolvedValue(mockStudents);

            const result = await studentRepository.findAll({
                page: 1,
                limit: 10,
                search: null,
                sortBy: 'created_at',
                order: 'desc'
            });

            expect(result.data).toHaveLength(2);
            expect(result.pagination.totalCount).toBe(2);
            expect(result.pagination.totalPages).toBe(1);
            expect(result.pagination.page).toBe(1);
            expect(prisma.student.findMany).toHaveBeenCalledWith(expect.objectContaining({
                skip: 0,
                take: 10,
                where: { deleted_at: null }
            }));
        });

        test('should apply search filter when provided', async () => {
            prisma.student.count.mockResolvedValue(1);
            prisma.student.findMany.mockResolvedValue([
                { id: BigInt(1), full_name: 'Nguyen Van A', student_class: [] }
            ]);

            await studentRepository.findAll({
                page: 1,
                limit: 10,
                search: 'Nguyen',
                sortBy: 'created_at',
                order: 'desc'
            });

            expect(prisma.student.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        deleted_at: null,
                        full_name: { contains: 'Nguyen', mode: 'insensitive' }
                    }
                })
            );
        });

        test('should calculate pagination correctly for multiple pages', async () => {
            prisma.student.count.mockResolvedValue(25);
            prisma.student.findMany.mockResolvedValue([]);

            const result = await studentRepository.findAll({
                page: 2,
                limit: 10,
                search: null,
                sortBy: 'created_at',
                order: 'desc'
            });

            expect(result.pagination.totalPages).toBe(3);
            expect(prisma.student.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ skip: 10, take: 10 })
            );
        });
    });

    describe('findByClass', () => {
        test('should return students by class ID', async () => {
            const mockStudents = [
                { id: BigInt(1), full_name: 'Student A', student_class: [] },
                { id: BigInt(2), full_name: 'Student B', student_class: [] }
            ];

            prisma.student.count.mockResolvedValue(2);
            prisma.student.findMany.mockResolvedValue(mockStudents);

            const result = await studentRepository.findByClass({
                page: 1,
                limit: 10,
                sortBy: 'created_at',
                order: 'desc',
                classId: BigInt(1)
            });

            expect(result.data).toHaveLength(2);
            expect(prisma.student.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        deleted_at: null,
                        student_class: { some: { class_id: BigInt(1) } }
                    }
                })
            );
        });
    });

    describe('findById', () => {
        test('should return student by ID', async () => {
            const mockStudent = {
                id: BigInt(1),
                full_name: 'Nguyen Van A',
                phone: '0901234567',
                student_class: []
            };

            prisma.student.findUnique.mockResolvedValue(mockStudent);

            const result = await studentRepository.findById(BigInt(1));

            expect(result).toEqual(mockStudent);
            expect(prisma.student.findUnique).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: BigInt(1), deleted_at: null }
                })
            );
        });

        test('should return null when student not found', async () => {
            prisma.student.findUnique.mockResolvedValue(null);

            const result = await studentRepository.findById(BigInt(999));

            expect(result).toBeNull();
        });
    });

    describe('existsByNameAndDob', () => {
        test('should return true when student exists', async () => {
            prisma.student.count.mockResolvedValue(1);

            const result = await studentRepository.existsByNameAndDob(
                'Nguyen Van A',
                '2000-01-01'
            );

            expect(result).toBe(true);
        });

        test('should return false when student does not exist', async () => {
            prisma.student.count.mockResolvedValue(0);

            const result = await studentRepository.existsByNameAndDob(
                'Non Existent',
                '2000-01-01'
            );

            expect(result).toBe(false);
        });

        test('should handle null dob', async () => {
            prisma.student.count.mockResolvedValue(0);

            await studentRepository.existsByNameAndDob('Test', null);

            expect(prisma.student.count).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        full_name: { equals: 'Test', mode: 'insensitive' },
                        dob: null
                    })
                })
            );
        });
    });

    describe('existsByPhone', () => {
        test('should return true when phone exists', async () => {
            prisma.student.count.mockResolvedValue(1);

            const result = await studentRepository.existsByPhone('0901234567');

            expect(result).toBe(true);
        });

        test('should return false when phone does not exist', async () => {
            prisma.student.count.mockResolvedValue(0);

            const result = await studentRepository.existsByPhone('0999999999');

            expect(result).toBe(false);
        });
    });

    describe('existsByNameAndDobExcludingId', () => {
        test('should exclude specified ID from check', async () => {
            prisma.student.count.mockResolvedValue(0);

            await studentRepository.existsByNameAndDobExcludingId(
                'Test',
                '2000-01-01',
                BigInt(1)
            );

            expect(prisma.student.count).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        id: { not: BigInt(1) }
                    })
                })
            );
        });
    });

    describe('existsByPhoneExcludingId', () => {
        test('should exclude specified ID from phone check', async () => {
            prisma.student.count.mockResolvedValue(0);

            await studentRepository.existsByPhoneExcludingId('0901234567', BigInt(1));

            expect(prisma.student.count).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        phone: '0901234567',
                        id: { not: BigInt(1) }
                    })
                })
            );
        });
    });

    describe('classExists', () => {
        test('should return true when class exists', async () => {
            prisma.renamedclass.count.mockResolvedValue(1);

            const result = await studentRepository.classExists(BigInt(1));

            expect(result).toBe(true);
        });

        test('should return false when class does not exist', async () => {
            prisma.renamedclass.count.mockResolvedValue(0);

            const result = await studentRepository.classExists(BigInt(999));

            expect(result).toBe(false);
        });
    });

    describe('isStudentInClass', () => {
        test('should return true when student is in class', async () => {
            prisma.student_class.count.mockResolvedValue(1);

            const result = await studentRepository.isStudentInClass(BigInt(1), BigInt(1));

            expect(result).toBe(true);
        });

        test('should return false when student is not in class', async () => {
            prisma.student_class.count.mockResolvedValue(0);

            const result = await studentRepository.isStudentInClass(BigInt(1), BigInt(2));

            expect(result).toBe(false);
        });
    });

    describe('create', () => {
        test('should create new student', async () => {
            const mockCreatedStudent = {
                id: BigInt(1),
                full_name: 'Nguyen Van A',
                phone: '0901234567',
                dob: new Date('2000-01-01'),
                student_class: []
            };

            prisma.student.create.mockResolvedValue(mockCreatedStudent);

            const result = await studentRepository.create({
                full_name: 'Nguyen Van A',
                phone: '0901234567',
                dob: '2000-01-01'
            });

            expect(result).toEqual(mockCreatedStudent);
            expect(prisma.student.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        full_name: 'Nguyen Van A',
                        phone: '0901234567',
                        dob: expect.any(Date)
                    })
                })
            );
        });
    });

    describe('update', () => {
        test('should update student with provided data', async () => {
            const mockUpdatedStudent = {
                id: BigInt(1),
                full_name: 'Updated Name',
                phone: '0901234567',
                student_class: []
            };

            prisma.student.update.mockResolvedValue(mockUpdatedStudent);

            const result = await studentRepository.update(BigInt(1), {
                full_name: 'Updated Name'
            });

            expect(result.full_name).toBe('Updated Name');
            expect(prisma.student.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: BigInt(1) },
                    data: expect.objectContaining({
                        full_name: 'Updated Name',
                        updated_at: expect.any(Date)
                    })
                })
            );
        });

        test('should handle partial updates', async () => {
            const mockUpdatedStudent = {
                id: BigInt(1),
                full_name: 'Original Name',
                phone: null,
                student_class: []
            };

            prisma.student.update.mockResolvedValue(mockUpdatedStudent);

            await studentRepository.update(BigInt(1), { phone: null });

            expect(prisma.student.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        phone: null
                    })
                })
            );
        });
    });

    describe('softDelete', () => {
        test('should soft delete student by setting deleted_at', async () => {
            prisma.student.update.mockResolvedValue({ id: BigInt(1) });

            await studentRepository.softDelete(BigInt(1));

            expect(prisma.student.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: BigInt(1) },
                    data: expect.objectContaining({
                        deleted_at: expect.any(Date)
                    })
                })
            );
        });
    });

    describe('delete', () => {
        test('should hard delete student', async () => {
            prisma.student.delete.mockResolvedValue({ id: BigInt(1) });

            await studentRepository.delete(BigInt(1));

            expect(prisma.student.delete).toHaveBeenCalledWith({
                where: { id: BigInt(1) }
            });
        });
    });

    describe('addToClass', () => {
        test('should add student to class', async () => {
            const mockResult = {
                student_id: BigInt(1),
                class_id: BigInt(2),
                joined_at: new Date()
            };

            prisma.student_class.create.mockResolvedValue(mockResult);

            const result = await studentRepository.addToClass(BigInt(1), BigInt(2));

            expect(result.student_id).toBe(BigInt(1));
            expect(result.class_id).toBe(BigInt(2));
            expect(prisma.student_class.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        student_id: BigInt(1),
                        class_id: BigInt(2),
                        joined_at: expect.any(Date)
                    })
                })
            );
        });
    });

    describe('removeFromClass', () => {
        test('should remove student from class', async () => {
            prisma.student_class.deleteMany.mockResolvedValue({ count: 1 });

            const result = await studentRepository.removeFromClass(BigInt(1), BigInt(2));

            expect(result.count).toBe(1);
            expect(prisma.student_class.deleteMany).toHaveBeenCalledWith({
                where: {
                    student_id: BigInt(1),
                    class_id: BigInt(2)
                }
            });
        });

        test('should return count 0 when student not in class', async () => {
            prisma.student_class.deleteMany.mockResolvedValue({ count: 0 });

            const result = await studentRepository.removeFromClass(BigInt(1), BigInt(999));

            expect(result.count).toBe(0);
        });
    });
});