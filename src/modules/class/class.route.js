const express = require('express');
const classController = require('./controller/class.controller');
const logger = require('../../utils/logger');

const router = express.Router();

logger.info('[ClassRoute] Đang khởi tạo class routes...');

/**
 * @route   GET /api/classes
 * @desc    Lấy danh sách lớp học (có filter, pagination)
 * @access  Public
 */
router.get('/', async (req, res, next) => {
    logger.info(`[ClassRoute] [GET /classes] Request | Query: ${JSON.stringify(req.query)} | IP: ${req.ip}`);
    await classController.getAll(req, res, next);
});

/**
 * @route   POST /api/classes
 * @desc    Tạo mới lớp học
 * @access  Private (Admin/Teacher)
 */
router.post('/', async (req, res, next) => {
    logger.info(`[ClassRoute] [POST /classes] Request | Name: ${req.body.name} | IP: ${req.ip}`);
    await classController.create(req, res, next);
});

/**
 * @route   GET /api/classes/:id
 * @desc    Lấy chi tiết lớp học theo ID
 * @access  Public
 */
router.get('/:id', async (req, res, next) => {
    logger.info(`[ClassRoute] [GET /classes/:id] Request | ID: ${req.params.id} | IP: ${req.ip}`);
    await classController.getById(req, res, next);
});

/**
 * @route   PUT /api/classes/:id
 * @desc    Cập nhật lớp học
 * @access  Private (Admin/Teacher)
 */
router.put('/:id', async (req, res, next) => {
    logger.info(`[ClassRoute] [PUT /classes/:id] Request | ID: ${req.params.id} | IP: ${req.ip}`);
    await classController.update(req, res, next);
});

/**
 * @route   DELETE /api/classes/:id
 * @desc    Xóa mềm lớp học
 * @access  Private (Admin/Teacher)
 */
router.delete('/:id', async (req, res, next) => {
    logger.info(`[ClassRoute] [DELETE /classes/:id] Request | ID: ${req.params.id} | IP: ${req.ip}`);
    await classController.delete(req, res, next);
});

/**
 * @route   DELETE /api/classes/:id/hard
 * @desc    Xóa cứng lớp học (xóa vĩnh viễn)
 * @access  Private (Admin only)
 */
router.delete('/:id/hard', async (req, res, next) => {
    logger.info(`[ClassRoute] [DELETE /classes/:id/hard] Request HARD DELETE | ID: ${req.params.id} | IP: ${req.ip}`);
    await classController.hardDelete(req, res, next);
});

/**
 * @route   GET /api/classes/:id/students
 * @desc    Lấy danh sách học sinh trong lớp
 * @access  Public
 */
router.get('/:id/students', async (req, res, next) => {
    logger.info(`[ClassRoute] [GET /classes/:id/students] Request | ID: ${req.params.id} | IP: ${req.ip}`);
    await classController.getStudents(req, res, next);
});

/**
 * @route   POST /api/classes/:id/students
 * @desc    Thêm học sinh vào lớp
 * @access  Private (Admin/Teacher)
 */
router.post('/:id/students', async (req, res, next) => {
    logger.info(`[ClassRoute] [POST /classes/:id/students] Request | ID: ${req.params.id} | IP: ${req.ip}`);
    await classController.addStudent(req, res, next);
});

/**
 * @route   DELETE /api/classes/:id/students/:studentId
 * @desc    Xóa học sinh khỏi lớp
 * @access  Private (Admin/Teacher)
 */
router.delete('/:id/students/:studentId', async (req, res, next) => {
    logger.info(`[ClassRoute] [DELETE /classes/:id/students/:studentId] Request | Class: ${req.params.id}, Student: ${req.params.studentId} | IP: ${req.ip}`);
    await classController.removeStudent(req, res, next);
});

logger.info('[ClassRoute] Khởi tạo class routes thành công');

module.exports = router;