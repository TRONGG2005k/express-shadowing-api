/**
 * Jest Setup File
 * Chạy trước mỗi test suite
 */

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.TZ = 'Asia/Ho_Chi_Minh';

// Global test utilities
global.testUtils = {
    /**
     * Tạo mock request object
     */
    createMockRequest: (overrides = {}) => ({
        body: {},
        params: {},
        query: {},
        headers: {},
        ip: '127.0.0.1',
        ...overrides
    }),
    
    /**
     * Tạo mock response object
     */
    createMockResponse: () => {
        const res = {
            statusCode: 200,
            jsonData: null,
            status(code) {
                this.statusCode = code;
                return this;
            },
            json(data) {
                this.jsonData = data;
                return this;
            }
        };
        return res;
    },
    
    /**
     * Tạo mock next function
     */
    createMockNext: () => jest.fn(),
    
    /**
     * Tạo mock data cho Student
     */
    createMockStudent: (overrides = {}) => ({
        id: BigInt(1),
        full_name: 'Nguyen Van A',
        phone: '0901234567',
        dob: new Date('2000-01-01'),
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        student_class: [],
        ...overrides
    }),
    
    /**
     * Tạo mock data cho Teacher
     */
    createMockTeacher: (overrides = {}) => ({
        id: BigInt(1),
        full_name: 'Tran Thi B',
        bio: 'Giáo viên tiếng Anh',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        Renamedclass: [],
        ...overrides
    }),
    
    /**
     * Tạo mock data cho Class
     */
    createMockClass: (overrides = {}) => ({
        id: BigInt(1),
        name: 'Lớp Tiếng Anh A1',
        description: 'Lớp học tiếng Anh cơ bản',
        teacher_id: BigInt(1),
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        teacher: null,
        _count: { student_class: 0, assignment_class: 0 },
        ...overrides
    })
};

// Silence console logs during tests unless explicitly needed
global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
};