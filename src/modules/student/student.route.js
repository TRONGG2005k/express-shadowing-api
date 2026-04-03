const express = require('express');
const studentController = require('./controller/student.controller');
const logger = require('../../utils/logger');

const router = express.Router();

logger.info('[StudentRoute] Đang khởi tạo student routes...');

/**
 * @route   GET /api/students
 * @desc    Lấy danh sách học sinh (có filter, pagination)
 * @access  Public
 */
router.get('/', async (req, res, next) => {
    logger.info(`[StudentRoute] [GET /students] Request | Query: ${JSON.stringify(req.query)} | IP: ${req.ip}`);
    await studentController.getAll(req, res, next);
});

/**
 * @route   POST /api/students
 * @desc    Tạo mới học sinh
 * @access  Private (Admin/Teacher)
 */
router.post('/', async (req, res, next) => {
    logger.info(`[StudentRoute] [POST /students] Request | Name: ${req.body.full_name} | IP: ${req.ip}`);
    await studentController.create(req, res, next);
});

/**
 * @route   GET /api/students/:id
 * @desc    Lấy chi tiết học sinh theo ID
 * @access  Public
 */
router.get('/:id', async (req, res, next) => {
    logger.info(`[StudentRoute] [GET /students/:id] Request | ID: ${req.params.id} | IP: ${req.ip}`);
    await studentController.getById(req, res, next);
});

/**
 * @route   PUT /api/students/:id
 * @desc    Cập nhật học sinh
 * @access  Private (Admin/Teacher)
 */
router.put('/:id', async (req, res, next) => {
    logger.info(`[StudentRoute] [PUT /students/:id] Request | ID: ${req.params.id} | IP: ${req.ip}`);
    await studentController.update(req, res, next);
});

/**
 * @route   DELETE /api/students/:id
 * @desc    Xóa mềm học sinh
 * @access  Private (Admin/Teacher)
 */
router.delete('/:id', async (req, res, next) => {
    logger.info(`[StudentRoute] [DELETE /students/:id] Request | ID: ${req.params.id} | IP: ${req.ip}`);
    await studentController.delete(req, res, next);
});

/**
 * @route   DELETE /api/students/:id/hard
 * @desc    Xóa cứng học sinh (xóa vĩnh viễn)
 * @access  Private (Admin only)
 */
router.delete('/:id/hard', async (req, res, next) => {
    logger.info(`[StudentRoute] [DELETE /students/:id/hard] Request HARD DELETE | ID: ${req.params.id} | IP: ${req.ip}`);
    await studentController.hardDelete(req, res, next);
});

/**
 * @route   POST /api/students/:id/classes
 * @desc    Thêm học sinh vào lớp học
 * @access  Private (Admin/Teacher)
 */
router.post('/:id/classes', async (req, res, next) => {
    logger.info(`[StudentRoute] [POST /students/:id/classes] Request | Student: ${req.params.id}, Class: ${req.body.class_id} | IP: ${req.ip}`);
    await studentController.addToClass(req, res, next);
});

/**
 * @route   DELETE /api/students/:id/classes/:classId
 * @desc    Xóa học sinh khỏi lớp học
 * @access  Private (Admin/Teacher)
 */
router.delete('/:id/classes/:classId', async (req, res, next) => {
    logger.info(`[StudentRoute] [DELETE /students/:id/classes/:classId] Request | Student: ${req.params.id}, Class: ${req.params.classId} | IP: ${req.ip}`);
    await studentController.removeFromClass(req, res, next);
});

logger.info('[StudentRoute] Khởi tạo student routes thành công');

module.exports = router;
