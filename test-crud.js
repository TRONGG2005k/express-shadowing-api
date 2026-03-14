/**
 * Test Script cho CRUD Operations
 * Test tất cả các module: users, students, teachers, vocabularies
 * 
 * Cách chạy:
 * 1. Đảm bảo server đang chạy: npm run devStart
 * 2. Chạy test: node test-crud.js
 */

const http = require('http');

const BASE_URL = 'localhost';
const PORT = process.env.PORT || 3000;

// Màu cho console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

// Test results tracker
const results = {
    passed: 0,
    failed: 0,
    tests: []
};

/**
 * Helper function để gọi API
 */
function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: BASE_URL,
            port: PORT,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                try {
                    const parsedData = responseData ? JSON.parse(responseData) : null;
                    resolve({
                        statusCode: res.statusCode,
                        data: parsedData
                    });
                } catch (e) {
                    resolve({
                        statusCode: res.statusCode,
                        data: responseData
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

/**
 * Log test result
 */
function logTest(testName, passed, details = '') {
    const status = passed ? `${colors.green}✓ PASS${colors.reset}` : `${colors.red}✗ FAIL${colors.reset}`;
    console.log(`${status} ${testName}`);
    if (details && !passed) {
        console.log(`  ${colors.yellow}Details: ${details}${colors.reset}`);
    }
    
    results.tests.push({ name: testName, passed, details });
    if (passed) results.passed++;
    else results.failed++;
}

/**
 * Print summary
 */
function printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log(`${colors.cyan}TEST SUMMARY${colors.reset}`);
    console.log('='.repeat(60));
    console.log(`Total Tests: ${results.passed + results.failed}`);
    console.log(`${colors.green}Passed: ${results.passed}${colors.reset}`);
    console.log(`${colors.red}Failed: ${results.failed}${colors.reset}`);
    console.log('='.repeat(60));
    
    if (results.failed > 0) {
        console.log(`\n${colors.red}Failed Tests:${colors.reset}`);
        results.tests.filter(t => !t.passed).forEach(t => {
            console.log(`  - ${t.name}: ${t.details}`);
        });
    }
}

// ==================== USER MODULE TESTS ====================

async function testUserModule() {
    console.log(`\n${colors.blue}========== TESTING USER MODULE ==========${colors.reset}\n`);
    
    let createdUserId = null;
    const testUsername = `testuser_${Date.now()}`;

    // Test 1: GET all users
    try {
        const response = await makeRequest('GET', '/api/users');
        const passed = response.statusCode === 200 && Array.isArray(response.data?.data);
        logTest('GET /api/users - Get all users', passed, 
            passed ? '' : `Status: ${response.statusCode}, Data: ${JSON.stringify(response.data)}`);
    } catch (error) {
        logTest('GET /api/users - Get all users', false, error.message);
    }

    // Test 2: POST create user
    try {
        const userData = {
            username: testUsername,
            phone: `0987${Math.floor(Math.random() * 1000000)}`,
            password_hash: 'hashedpassword123',
            role: 'student'
        };
        const response = await makeRequest('POST', '/api/users', userData);
        const passed = response.statusCode === 201 && response.data?.success;
        if (passed && response.data?.data?.id) {
            createdUserId = response.data.data.id;
        }
        logTest('POST /api/users - Create user', passed, 
            passed ? '' : `Status: ${response.statusCode}, Data: ${JSON.stringify(response.data)}`);
    } catch (error) {
        logTest('POST /api/users - Create user', false, error.message);
    }

    // Test 3: GET user by ID
    if (createdUserId) {
        try {
            const response = await makeRequest('GET', `/api/users/${createdUserId}`);
            const passed = response.statusCode === 200 && response.data?.data?.id == createdUserId;
            logTest('GET /api/users/:id - Get user by ID', passed, 
                passed ? '' : `Status: ${response.statusCode}, Data: ${JSON.stringify(response.data)}`);
        } catch (error) {
            logTest('GET /api/users/:id - Get user by ID', false, error.message);
        }

        // Test 4: PUT update user
        try {
            const updateData = {
                phone: `0988${Math.floor(Math.random() * 1000000)}`
            };
            const response = await makeRequest('PUT', `/api/users/${createdUserId}`, updateData);
            const passed = response.statusCode === 200 && response.data?.success;
            logTest('PUT /api/users/:id - Update user', passed, 
                passed ? '' : `Status: ${response.statusCode}, Data: ${JSON.stringify(response.data)}`);
        } catch (error) {
            logTest('PUT /api/users/:id - Update user', false, error.message);
        }

        // Test 5: DELETE user
        try {
            const response = await makeRequest('DELETE', `/api/users/${createdUserId}`);
            const passed = response.statusCode === 200 && response.data?.success;
            logTest('DELETE /api/users/:id - Delete user', passed, 
                passed ? '' : `Status: ${response.statusCode}, Data: ${JSON.stringify(response.data)}`);
        } catch (error) {
            logTest('DELETE /api/users/:id - Delete user', false, error.message);
        }
    }

    return createdUserId;
}

// ==================== STUDENT MODULE TESTS ====================

async function testStudentModule() {
    console.log(`\n${colors.blue}========== TESTING STUDENT MODULE ==========${colors.reset}\n`);
    
    let createdStudentId = null;

    // Test 1: GET all students
    try {
        const response = await makeRequest('GET', '/api/students');
        const passed = response.statusCode === 200 && response.data?.data !== undefined;
        logTest('GET /api/students - Get all students', passed, 
            passed ? '' : `Status: ${response.statusCode}, Data: ${JSON.stringify(response.data)}`);
    } catch (error) {
        logTest('GET /api/students - Get all students', false, error.message);
    }

    // Test 2: POST create student
    try {
        const studentData = {
            full_name: `Test Student ${Date.now()}`,
            phone: `0977${Math.floor(Math.random() * 1000000)}`,
            dob: '2005-05-15'
        };
        const response = await makeRequest('POST', '/api/students', studentData);
        const passed = response.statusCode === 201 && response.data?.success;
        if (passed && response.data?.data?.id) {
            createdStudentId = response.data.data.id;
        }
        logTest('POST /api/students - Create student', passed, 
            passed ? '' : `Status: ${response.statusCode}, Data: ${JSON.stringify(response.data)}`);
    } catch (error) {
        logTest('POST /api/students - Create student', false, error.message);
    }

    // Test 3: GET student by ID
    if (createdStudentId) {
        try {
            const response = await makeRequest('GET', `/api/students/${createdStudentId}`);
            const passed = response.statusCode === 200 && response.data?.data?.id == createdStudentId;
            logTest('GET /api/students/:id - Get student by ID', passed, 
                passed ? '' : `Status: ${response.statusCode}, Data: ${JSON.stringify(response.data)}`);
        } catch (error) {
            logTest('GET /api/students/:id - Get student by ID', false, error.message);
        }

        // Test 4: PUT update student
        try {
            const updateData = {
                full_name: `Updated Student ${Date.now()}`,
                phone: `0966${Math.floor(Math.random() * 1000000)}`
            };
            const response = await makeRequest('PUT', `/api/students/${createdStudentId}`, updateData);
            const passed = response.statusCode === 200 && response.data?.success;
            logTest('PUT /api/students/:id - Update student', passed, 
                passed ? '' : `Status: ${response.statusCode}, Data: ${JSON.stringify(response.data)}`);
        } catch (error) {
            logTest('PUT /api/students/:id - Update student', false, error.message);
        }

        // Test 5: DELETE student (soft delete)
        try {
            const response = await makeRequest('DELETE', `/api/students/${createdStudentId}`);
            const passed = response.statusCode === 200 && response.data?.success;
            logTest('DELETE /api/students/:id - Soft delete student', passed, 
                passed ? '' : `Status: ${response.statusCode}, Data: ${JSON.stringify(response.data)}`);
        } catch (error) {
            logTest('DELETE /api/students/:id - Soft delete student', false, error.message);
        }

        // Test 6: Hard delete student
        try {
            const response = await makeRequest('DELETE', `/api/students/${createdStudentId}/hard`);
            const passed = response.statusCode === 200 && response.data?.success;
            logTest('DELETE /api/students/:id/hard - Hard delete student', passed, 
                passed ? '' : `Status: ${response.statusCode}, Data: ${JSON.stringify(response.data)}`);
        } catch (error) {
            logTest('DELETE /api/students/:id/hard - Hard delete student', false, error.message);
        }
    }

    return createdStudentId;
}

// ==================== TEACHER MODULE TESTS ====================

async function testTeacherModule() {
    console.log(`\n${colors.blue}========== TESTING TEACHER MODULE ==========${colors.reset}\n`);
    
    let createdTeacherId = null;

    // Test 1: GET all teachers
    try {
        const response = await makeRequest('GET', '/api/teachers');
        const passed = response.statusCode === 200 && response.data?.data !== undefined;
        logTest('GET /api/teachers - Get all teachers', passed, 
            passed ? '' : `Status: ${response.statusCode}, Data: ${JSON.stringify(response.data)}`);
    } catch (error) {
        logTest('GET /api/teachers - Get all teachers', false, error.message);
    }

    // Test 2: POST create teacher
    try {
        const teacherData = {
            full_name: `Test Teacher ${Date.now()}`,
            bio: 'This is a test teacher bio'
        };
        const response = await makeRequest('POST', '/api/teachers', teacherData);
        const passed = response.statusCode === 201 && response.data?.success;
        if (passed && response.data?.data?.id) {
            createdTeacherId = response.data.data.id;
        }
        logTest('POST /api/teachers - Create teacher', passed, 
            passed ? '' : `Status: ${response.statusCode}, Data: ${JSON.stringify(response.data)}`);
    } catch (error) {
        logTest('POST /api/teachers - Create teacher', false, error.message);
    }

    // Test 3: GET teacher by ID
    if (createdTeacherId) {
        try {
            const response = await makeRequest('GET', `/api/teachers/${createdTeacherId}`);
            const passed = response.statusCode === 200 && response.data?.data?.id == createdTeacherId;
            logTest('GET /api/teachers/:id - Get teacher by ID', passed, 
                passed ? '' : `Status: ${response.statusCode}, Data: ${JSON.stringify(response.data)}`);
        } catch (error) {
            logTest('GET /api/teachers/:id - Get teacher by ID', false, error.message);
        }

        // Test 4: PUT update teacher
        try {
            const updateData = {
                full_name: `Updated Teacher ${Date.now()}`,
                bio: 'Updated bio for test teacher'
            };
            const response = await makeRequest('PUT', `/api/teachers/${createdTeacherId}`, updateData);
            const passed = response.statusCode === 200 && response.data?.success;
            logTest('PUT /api/teachers/:id - Update teacher', passed, 
                passed ? '' : `Status: ${response.statusCode}, Data: ${JSON.stringify(response.data)}`);
        } catch (error) {
            logTest('PUT /api/teachers/:id - Update teacher', false, error.message);
        }

        // Test 5: DELETE teacher (soft delete)
        try {
            const response = await makeRequest('DELETE', `/api/teachers/${createdTeacherId}`);
            const passed = response.statusCode === 200 && response.data?.success;
            logTest('DELETE /api/teachers/:id - Soft delete teacher', passed, 
                passed ? '' : `Status: ${response.statusCode}, Data: ${JSON.stringify(response.data)}`);
        } catch (error) {
            logTest('DELETE /api/teachers/:id - Soft delete teacher', false, error.message);
        }

        // Test 6: Hard delete teacher
        try {
            const response = await makeRequest('DELETE', `/api/teachers/${createdTeacherId}/hard`);
            const passed = response.statusCode === 200 && response.data?.success;
            logTest('DELETE /api/teachers/:id/hard - Hard delete teacher', passed, 
                passed ? '' : `Status: ${response.statusCode}, Data: ${JSON.stringify(response.data)}`);
        } catch (error) {
            logTest('DELETE /api/teachers/:id/hard - Hard delete teacher', false, error.message);
        }
    }

    return createdTeacherId;
}

// ==================== VOCABULARY MODULE TESTS ====================

async function testVocabularyModule() {
    console.log(`\n${colors.blue}========== TESTING VOCABULARY MODULE ==========${colors.reset}\n`);
    
    let createdVocabId = null;
    let createdById = null;

    // Try to get a valid user ID for created_by
    try {
        const usersResponse = await makeRequest('GET', '/api/users');
        if (usersResponse.data?.data && usersResponse.data.data.length > 0) {
            createdById = usersResponse.data.data[0].id;
        }
    } catch (e) {
        // Ignore, we'll use a default
    }
    
    if (!createdById) {
        createdById = 1; // Default fallback
    }

    // Test 1: GET all vocabularies
    try {
        const response = await makeRequest('GET', '/api/vocabularies');
        const passed = response.statusCode === 200 && response.data?.data !== undefined;
        logTest('GET /api/vocabularies - Get all vocabularies', passed, 
            passed ? '' : `Status: ${response.statusCode}, Data: ${JSON.stringify(response.data)}`);
    } catch (error) {
        logTest('GET /api/vocabularies - Get all vocabularies', false, error.message);
    }

    // Test 2: GET topics
    try {
        const response = await makeRequest('GET', '/api/vocabularies/topics');
        const passed = response.statusCode === 200;
        logTest('GET /api/vocabularies/topics - Get all topics', passed, 
            passed ? '' : `Status: ${response.statusCode}, Data: ${JSON.stringify(response.data)}`);
    } catch (error) {
        logTest('GET /api/vocabularies/topics - Get all topics', false, error.message);
    }

    // Test 3: POST create vocabulary
    try {
        const vocabData = {
            word: `testword_${Date.now()}`,
            type: 'noun',
            topic: 'General',
            phonetic: '/test/',
            meaning_vi: 'Từ kiểm tra',
            explanation: 'This is a test vocabulary',
            example_sentence: 'This is a test sentence.',
            example_translation: 'Đây là câu kiểm tra.',
            created_by: createdById
        };
        const response = await makeRequest('POST', '/api/vocabularies', vocabData);
        const passed = response.statusCode === 201 && response.data?.success;
        if (passed && response.data?.data?.id) {
            createdVocabId = response.data.data.id;
        }
        logTest('POST /api/vocabularies - Create vocabulary', passed, 
            passed ? '' : `Status: ${response.statusCode}, Data: ${JSON.stringify(response.data)}`);
    } catch (error) {
        logTest('POST /api/vocabularies - Create vocabulary', false, error.message);
    }

    // Test 4: GET vocabulary by ID
    if (createdVocabId) {
        try {
            const response = await makeRequest('GET', `/api/vocabularies/${createdVocabId}`);
            const passed = response.statusCode === 200 && response.data?.data?.id == createdVocabId;
            logTest('GET /api/vocabularies/:id - Get vocabulary by ID', passed, 
                passed ? '' : `Status: ${response.statusCode}, Data: ${JSON.stringify(response.data)}`);
        } catch (error) {
            logTest('GET /api/vocabularies/:id - Get vocabulary by ID', false, error.message);
        }

        // Test 5: PUT update vocabulary
        try {
            const updateData = {
                meaning_vi: 'Nghĩa đã cập nhật',
                explanation: 'Updated explanation'
            };
            const response = await makeRequest('PUT', `/api/vocabularies/${createdVocabId}`, updateData);
            const passed = response.statusCode === 200 && response.data?.success;
            logTest('PUT /api/vocabularies/:id - Update vocabulary', passed, 
                passed ? '' : `Status: ${response.statusCode}, Data: ${JSON.stringify(response.data)}`);
        } catch (error) {
            logTest('PUT /api/vocabularies/:id - Update vocabulary', false, error.message);
        }

        // Test 6: DELETE vocabulary (soft delete)
        try {
            const response = await makeRequest('DELETE', `/api/vocabularies/${createdVocabId}`);
            const passed = response.statusCode === 200 && response.data?.success;
            logTest('DELETE /api/vocabularies/:id - Soft delete vocabulary', passed, 
                passed ? '' : `Status: ${response.statusCode}, Data: ${JSON.stringify(response.data)}`);
        } catch (error) {
            logTest('DELETE /api/vocabularies/:id - Soft delete vocabulary', false, error.message);
        }

        // Test 7: Hard delete vocabulary
        try {
            const response = await makeRequest('DELETE', `/api/vocabularies/${createdVocabId}/hard`);
            const passed = response.statusCode === 200 && response.data?.success;
            logTest('DELETE /api/vocabularies/:id/hard - Hard delete vocabulary', passed, 
                passed ? '' : `Status: ${response.statusCode}, Data: ${JSON.stringify(response.data)}`);
        } catch (error) {
            logTest('DELETE /api/vocabularies/:id/hard - Hard delete vocabulary', false, error.message);
        }
    }

    return createdVocabId;
}

// ==================== MAIN TEST RUNNER ====================

async function runAllTests() {
    console.log(`${colors.cyan}
╔════════════════════════════════════════════════════════════╗
║         CRUD API TEST SUITE - Shadowing API               ║
╚════════════════════════════════════════════════════════════╝${colors.reset}`);
    
    // Health check
    console.log(`\n${colors.yellow}Checking server health...${colors.reset}`);
    try {
        const health = await makeRequest('GET', '/api/health');
        if (health.statusCode === 200) {
            console.log(`${colors.green}✓ Server is running on port ${PORT}${colors.reset}\n`);
        } else {
            console.log(`${colors.red}✗ Server health check failed${colors.reset}\n`);
            process.exit(1);
        }
    } catch (error) {
        console.log(`${colors.red}✗ Cannot connect to server on port ${PORT}${colors.reset}`);
        console.log(`Error: ${error.message}`);
        console.log(`\n${colors.yellow}Please ensure the server is running with: npm run devStart${colors.reset}\n`);
        process.exit(1);
    }

    // Run all module tests
    await testUserModule();
    await testStudentModule();
    await testTeacherModule();
    await testVocabularyModule();

    // Print summary
    printSummary();

    // Exit with appropriate code
    process.exit(results.failed > 0 ? 1 : 0);
}

// Handle unhandled errors
process.on('unhandledRejection', (error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
});

// Run tests
runAllTests();
