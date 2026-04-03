const express = require('express');
const teacherController = require('./controller/teacher.controller');
const logger = require('../../utils/logger');

const router = express.Router();

logger.info('[TeacherRoute] Đang khởi tạo teacher routes...');

/**
 * @route   GET /api/teachers
 * @desc    Lấy danh sách giáo viên (có filter, pagination)
 * @access  Public
 */
router.get('/', async (req, res, next) => {
    logger.info(`[TeacherRoute] [GET /teachers] Request | Query: ${JSON.stringify(req.query)} | IP: ${req.ip}`);
    await teacherController.getAll(req, res, next);
});

/**
 * @route   POST /api/teachers
 * @desc    Tạo mới giáo viên
 * @access  Private (Admin)
 */
router.post('/', async (req, res, next) => {
    logger.info(`[TeacherRoute] [POST /teachers] Request | Name: ${req.body.full_name} | IP: ${req.ip}`);
    await teacherController.create(req, res, next);
});

/**
 * @route   GET /api/teachers/:id
 * @desc    Lấy chi tiết giáo viên theo ID
 * @access  Public
 */
router.get('/:id', async (req, res, next) => {
    logger.info(`[TeacherRoute] [GET /teachers/:id] Request | ID: ${req.params.id} | IP: ${req.ip}`);
    await teacherController.getById(req, res, next);
});

/**
 * @route   PUT /api/teachers/:id
 * @desc    Cập nhật giáo viên
 * @access  Private (Admin)
 */
router.put('/:id', async (req, res, next) => {
    logger.info(`[TeacherRoute] [PUT /teachers/:id] Request | ID: ${req.params.id} | IP: ${req.ip}`);
    await teacherController.update(req, res, next);
});

/**
 * @route   DELETE /api/teachers/:id
 * @desc    Xóa mềm giáo viên
 * @access  Private (Admin)
 */
router.delete('/:id', async (req, res, next) => {
    logger.info(`[TeacherRoute] [DELETE /teachers/:id] Request | ID: ${req.params.id} | IP: ${req.ip}`);
    await teacherController.delete(req, res, next);
});

/**
 * @route   DELETE /api/teachers/:id/hard
 * @desc    Xóa cứng giáo viên (xóa vĩnh viễn)
 * @access  Private (Admin only)
 */
router.delete('/:id/hard', async (req, res, next) => {
    logger.info(`[TeacherRoute] [DELETE /teachers/:id/hard] Request HARD DELETE | ID: ${req.params.id} | IP: ${req.ip}`);
    await teacherController.hardDelete(req, res, next);
});

/**
 * @route   GET /api/teachers/:id/classes
 * @desc    Lấy danh sách lớp học của giáo viên
 * @access  Public
 */
router.get('/:id/classes', async (req, res, next) => {
    logger.info(`[TeacherRoute] [GET /teachers/:id/classes] Request | ID: ${req.params.id} | IP: ${req.ip}`);
    await teacherController.getClasses(req, res, next);
});

logger.info('[TeacherRoute] Khởi tạo teacher routes thành công');

module.exports = router;
