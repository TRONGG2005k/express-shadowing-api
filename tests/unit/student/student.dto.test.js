/**
 * Unit Tests - Student DTOs
 * Kiểm thử các Data Transfer Objects cho Student module
 */

const {
    CreateStudentDto,
    UpdateStudentDto,
    StudentQueryDto,
    StudentIdParamDto,
    AddToClassDto
} = require('../../../src/modules/student/dto/create-student.dto');

describe('Student DTOs', () => {
    describe('CreateStudentDto', () => {
        test('should validate valid student data', () => {
            const validData = {
                full_name: 'Nguyen Van A',
                phone: '0901234567',
                dob: '2000-01-01'
            };
            
            const result = CreateStudentDto.parse(validData);
            expect(result.full_name).toBe('Nguyen Van A');
            expect(result.phone).toBe('0901234567');
            expect(result.dob).toBeInstanceOf(Date);
        });

        test('should accept student without optional fields', () => {
            const validData = {
                full_name: 'Nguyen Van A'
            };
            
            const result = CreateStudentDto.parse(validData);
            expect(result.full_name).toBe('Nguyen Van A');
            expect(result.phone).toBeUndefined();
            expect(result.dob).toBeUndefined();
        });

        test('should reject empty full_name', () => {
            const invalidData = {
                full_name: '',
                phone: '0901234567'
            };
            
            expect(() => CreateStudentDto.parse(invalidData)).toThrow();
        });

        test('should reject full_name exceeding 100 characters', () => {
            const invalidData = {
                full_name: 'A'.repeat(101)
            };
            
            expect(() => CreateStudentDto.parse(invalidData)).toThrow();
        });

        test('should reject invalid phone format', () => {
            const invalidData = {
                full_name: 'Nguyen Van A',
                phone: 'abc123'
            };
            
            expect(() => CreateStudentDto.parse(invalidData)).toThrow();
        });

        test('should reject phone exceeding 20 characters', () => {
            const invalidData = {
                full_name: 'Nguyen Van A',
                phone: '0'.repeat(21)
            };
            
            expect(() => CreateStudentDto.parse(invalidData)).toThrow();
        });

        test('should reject future date of birth', () => {
            const futureDate = new Date();
            futureDate.setFullYear(futureDate.getFullYear() + 1);
            
            const invalidData = {
                full_name: 'Nguyen Van A',
                dob: futureDate.toISOString()
            };
            
            expect(() => CreateStudentDto.parse(invalidData)).toThrow();
        });

        test('should accept valid phone formats', () => {
            const validPhones = [
                '0901234567',
                '+84 901 234 567',
                '(090) 123-4567',
                '090-123-4567'
            ];
            
            validPhones.forEach(phone => {
                const data = { full_name: 'Test', phone };
                expect(() => CreateStudentDto.parse(data)).not.toThrow();
            });
        });
    });

    describe('UpdateStudentDto', () => {
        test('should accept empty object (all fields optional)', () => {
            const result = UpdateStudentDto.parse({});
            expect(result).toEqual({});
        });

        test('should accept partial update', () => {
            const partialData = {
                phone: '0912345678'
            };
            
            const result = UpdateStudentDto.parse(partialData);
            expect(result.phone).toBe('0912345678');
        });

        test('should apply same validation as CreateStudentDto', () => {
            const invalidData = {
                full_name: '',
                phone: 'invalid'
            };
            
            expect(() => UpdateStudentDto.parse(invalidData)).toThrow();
        });
    });

    describe('StudentQueryDto', () => {
        test('should use default values for empty query', () => {
            const result = StudentQueryDto.parse({});
            expect(result.page).toBe(1);
            expect(result.limit).toBe(10);
            expect(result.sortBy).toBe('created_at');
            expect(result.order).toBe('desc');
        });

        test('should accept custom pagination values', () => {
            const query = {
                page: '2',
                limit: '20',
                sortBy: 'full_name',
                order: 'asc'
            };
            
            const result = StudentQueryDto.parse(query);
            expect(result.page).toBe(2);
            expect(result.limit).toBe(20);
            expect(result.sortBy).toBe('full_name');
            expect(result.order).toBe('asc');
        });

        test('should accept search parameter', () => {
            const query = {
                search: 'Nguyen'
            };
            
            const result = StudentQueryDto.parse(query);
            expect(result.search).toBe('Nguyen');
        });

        test('should accept classId filter', () => {
            const query = {
                classId: '123'
            };
            
            const result = StudentQueryDto.parse(query);
            expect(result.classId).toBe(BigInt(123));
        });

        test('should reject limit exceeding 100', () => {
            const query = {
                limit: '101'
            };
            
            expect(() => StudentQueryDto.parse(query)).toThrow();
        });

        test('should reject invalid sortBy', () => {
            const query = {
                sortBy: 'invalid_field'
            };
            
            expect(() => StudentQueryDto.parse(query)).toThrow();
        });

        test('should reject invalid order', () => {
            const query = {
                order: 'invalid'
            };
            
            expect(() => StudentQueryDto.parse(query)).toThrow();
        });
    });

    describe('StudentIdParamDto', () => {
        test('should accept valid bigint ID', () => {
            const param = { id: '123' };
            const result = StudentIdParamDto.parse(param);
            expect(result.id).toBe(BigInt(123));
        });

        test('should accept BigInt directly', () => {
            const param = { id: BigInt(123) };
            const result = StudentIdParamDto.parse(param);
            expect(result.id).toBe(BigInt(123));
        });

        test('should reject negative ID', () => {
            const param = { id: '-1' };
            expect(() => StudentIdParamDto.parse(param)).toThrow();
        });

        test('should reject zero ID', () => {
            const param = { id: '0' };
            expect(() => StudentIdParamDto.parse(param)).toThrow();
        });

        test('should reject non-numeric ID', () => {
            const param = { id: 'abc' };
            expect(() => StudentIdParamDto.parse(param)).toThrow();
        });
    });

    describe('AddToClassDto', () => {
        test('should accept valid class_id', () => {
            const data = { class_id: '123' };
            const result = AddToClassDto.parse(data);
            expect(result.class_id).toBe(BigInt(123));
        });

        test('should reject invalid class_id', () => {
            const data = { class_id: 'invalid' };
            expect(() => AddToClassDto.parse(data)).toThrow();
        });

        test('should reject negative class_id', () => {
            const data = { class_id: '-1' };
            expect(() => AddToClassDto.parse(data)).toThrow();
        });
    });
});