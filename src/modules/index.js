const express = require('express');
const userRoutes = require('./user/user.route');
const vocabularyRoutes = require('./vocabulary/vocabulary.route');
const logger = require('../utils/logger');

const router = express.Router();

logger.info('[Module] Đang khởi tạo routes cho các module...');

// Mount user routes
logger.info('[Module] Mount route: /users');
router.use('/users', userRoutes);

// Mount vocabulary routes
logger.info('[Module] Mount route: /vocabularies');
router.use('/vocabularies', vocabularyRoutes);

logger.info('[Module] Khởi tạo routes thành công');

module.exports = router;
