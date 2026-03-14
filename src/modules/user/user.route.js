const express = require('express');
const userController = require('./controller/user.controller');
const logger = require('../../utils/logger');

const router = express.Router();

logger.info('[UserRoute] Đang khởi tạo user routes...');

/**
 * @route   GET /api/users
 * @desc    Lấy danh sách tất cả users
 * @access  Public
 */
router.get('/', async (req, res, next) => {
    logger.info(`[UserRoute] [GET /users] Request | IP: ${req.ip}`);
    await userController.getAll(req, res, next);
});

/**
 * @route   GET /api/users/:id
 * @desc    Lấy chi tiết user theo ID
 * @access  Public
 */
router.get('/:id', async (req, res, next) => {
    logger.info(`[UserRoute] [GET /users/:id] Request | ID: ${req.params.id} | IP: ${req.ip}`);
    await userController.getById(req, res, next);
});

/**
 * @route   POST /api/users
 * @desc    Tạo mới user
 * @access  Public
 */
router.post('/', async (req, res, next) => {
    logger.info(`[UserRoute] [POST /users] Request | IP: ${req.ip}`);
    await userController.create(req, res, next);
});

/**
 * @route   PUT /api/users/:id
 * @desc    Cập nhật user
 * @access  Public
 */
router.put('/:id', async (req, res, next) => {
    logger.info(`[UserRoute] [PUT /users/:id] Request | ID: ${req.params.id} | IP: ${req.ip}`);
    await userController.update(req, res, next);
});

/**
 * @route   DELETE /api/users/:id
 * @desc    Xóa user (soft delete)
 * @access  Public
 */
router.delete('/:id', async (req, res, next) => {
    logger.info(`[UserRoute] [DELETE /users/:id] Request | ID: ${req.params.id} | IP: ${req.ip}`);
    await userController.delete(req, res, next);
});

/**
 * @route   DELETE /api/users/:id/hard
 * @desc    Xóa user vĩnh viễn (hard delete)
 * @access  Public
 */
router.delete('/:id/hard', async (req, res, next) => {
    logger.info(`[UserRoute] [DELETE /users/:id/hard] Request | ID: ${req.params.id} | IP: ${req.ip}`);
    await userController.hardDelete(req, res, next);
});

/**
 * @route   POST /api/users/with-ref
 * @desc    Tạo user với ref_id và ref_type bắt buộc
 * @access  Public
 */
router.post('/with-ref', async (req, res, next) => {
    logger.info(`[UserRoute] [POST /users/with-ref] Request | IP: ${req.ip}`);
    await userController.createWithRef(req, res, next);
});

logger.info('[UserRoute] Khởi tạo user routes thành công');

module.exports = router;
