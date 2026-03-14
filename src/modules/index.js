const express = require('express');
const userRoutes = require('./user/user.route');
const vocabularyRoutes = require('./vocabulary/vocabulary.route');
const studentRoutes = require('./student/student.route');
const teacherRoutes = require('./teacher/teacher.route');
const logger = require('../utils/logger');

const router = express.Router();

logger.info('[Module] Đang khởi tạo routes cho các module...');

// Mount user routes
logger.info('[Module] Mount route: /users');
router.use('/users', userRoutes);

// Mount vocabulary routes
logger.info('[Module] Mount route: /vocabularies');
router.use('/vocabularies', vocabularyRoutes);

// Mount student routes
logger.info('[Module] Mount route: /students');
router.use('/students', studentRoutes);

// Mount teacher routes
logger.info('[Module] Mount route: /teachers');
router.use('/teachers', teacherRoutes);

logger.info('[Module] Khởi tạo routes thành công');

module.exports = router;
