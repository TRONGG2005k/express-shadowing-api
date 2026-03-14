/**
 * Jest Configuration
 */
module.exports = {
    // Môi trường kiểm thử là Node.js
    testEnvironment: 'node',
    
    // Thư mục chứa các file kiểm thử
    testMatch: [
        '**/tests/**/*.test.js'
    ],
    
    // Thư mục cần bỏ qua
    testPathIgnorePatterns: [
        '/node_modules/'
    ],
    
    // Coverage configuration
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/config/**',
        '!src/utils/logger.js'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: [
        'text',
        'lcov',
        'html'
    ],
    
    // Setup files
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    
    // Module name mapper để xử lý alias
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1'
    },
    
    // Thờigian timeout cho các test
    testTimeout: 10000,
    
    // Clear mocks sau mỗi test
    clearMocks: true,
    
    // Verbose mode để hiển thị chi tiết
    verbose: true
};