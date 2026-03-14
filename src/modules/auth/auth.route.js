const express = require('express');
const authController = require('./controller/auth.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const logger = require('../../utils/logger');

const router = express.Router();

logger.info('[AuthRoute] Đang khởi tạo auth routes...');

/**
 * @route   POST /api/auth/register
 * @desc    Đăng ký
 * @access  Public
 */
router.post('/register', async (req, res, next) => {
    logger.info(`[AuthRoute] [POST /register] Request | IP: ${req.ip}`);
    await authController.register(req, res, next);
});

/**
 * @route   POST /api/auth/login
 * @desc    Đăng nhập
 * @access  Public
 */
router.post('/login', async (req, res, next) => {
    logger.info(`[AuthRoute] [POST /login] Request | IP: ${req.ip}`);
    await authController.login(req, res, next);
});

/**
 * @route   GET /api/auth/refresh
 * @desc    Refresh token - Lấy refresh token từ cookie, không cần body
 * @access  Public (nhưng cần refresh token hợp lệ)
 */
router.get('/refresh', async (req, res, next) => {
    logger.info(`[AuthRoute] [GET /refresh] Request | IP: ${req.ip}`);
    await authController.refresh(req, res, next);
});

/**
 * @route   POST /api/auth/logout
 * @desc    Đăng xuất
 * @access  Public
 */
router.post('/logout', async (req, res, next) => {
    logger.info(`[AuthRoute] [POST /logout] Request | IP: ${req.ip}`);
    await authController.logout(req, res, next);
});

/**
 * @route   POST /api/auth/logout-all
 * @desc    Đăng xuất khởi tất cả thiết bị
 * @access  Private
 */
router.post('/logout-all', authMiddleware.authenticate, async (req, res, next) => {
    logger.info(`[AuthRoute] [POST /logout-all] Request | UserID: ${req.user?.userId} | IP: ${req.ip}`);
    await authController.logoutAll(req, res, next);
});

/**
 * @route   GET /api/auth/me
 * @desc    Lấy thông tin user hiện tại
 * @access  Private
 */
router.get('/me', authMiddleware.authenticate, async (req, res, next) => {
    logger.info(`[AuthRoute] [GET /me] Request | UserID: ${req.user?.userId} | IP: ${req.ip}`);
    await authController.getCurrentUser(req, res, next);
});

logger.info('[AuthRoute] Khởi tạo auth routes thành công');

module.exports = router;
