const express = require('express');
const vocabularyController = require('./controller/vocabulary.controller');
const logger = require('../../utils/logger');

const router = express.Router();

logger.info('[VocabularyRoute] Đang khởi tạo vocabulary routes...');

/**
 * @route   GET /api/vocabularies
 * @desc    Lấy danh sách từ vựng (có filter, pagination)
 * @access  Public
 */
router.get('/', async (req, res, next) => {
    logger.info(`[VocabularyRoute] [GET /vocabularies] Request | Query: ${JSON.stringify(req.query)} | IP: ${req.ip}`);
    await vocabularyController.getAll(req, res, next);
});

/**
 * @route   GET /api/vocabularies/topics
 * @desc    Lấy danh sách tất cả chủ đề (topics)
 * @access  Public
 */
router.get('/topics', async (req, res, next) => {
    logger.info(`[VocabularyRoute] [GET /vocabularies/topics] Request | IP: ${req.ip}`);
    await vocabularyController.getTopics(req, res, next);
});

/**
 * @route   GET /api/vocabularies/search
 * @desc    Tìm kiếm từ vựng theo word chính xác
 * @access  Public
 */
router.get('/search', async (req, res, next) => {
    logger.info(`[VocabularyRoute] [GET /vocabularies/search] Request | Word: ${req.query.word} | IP: ${req.ip}`);
    await vocabularyController.searchByWord(req, res, next);
});

/**
 * @route   POST /api/vocabularies/batch
 * @desc    Tạo nhiều từ vựng cùng lúc
 * @access  Private (Admin/Teacher)
 */
router.post('/batch', async (req, res, next) => {
    logger.info(`[VocabularyRoute] [POST /vocabularies/batch] Request | Số lượng: ${req.body.items?.length || 0} | IP: ${req.ip}`);
    await vocabularyController.createBatch(req, res, next);
});

/**
 * @route   GET /api/vocabularies/:id
 * @desc    Lấy chi tiết từ vựng theo ID
 * @access  Public
 */
router.get('/:id', async (req, res, next) => {
    logger.info(`[VocabularyRoute] [GET /vocabularies/:id] Request | ID: ${req.params.id} | IP: ${req.ip}`);
    await vocabularyController.getById(req, res, next);
});

/**
 * @route   POST /api/vocabularies
 * @desc    Tạo mới từ vựng
 * @access  Private (Admin/Teacher)
 */
router.post('/', async (req, res, next) => {
    logger.info(`[VocabularyRoute] [POST /vocabularies] Request | Word: ${req.body.word} | IP: ${req.ip}`);
    await vocabularyController.create(req, res, next);
});

/**
 * @route   PUT /api/vocabularies/:id
 * @desc    Cập nhật từ vựng
 * @access  Private (Admin/Teacher)
 */
router.put('/:id', async (req, res, next) => {
    logger.info(`[VocabularyRoute] [PUT /vocabularies/:id] Request | ID: ${req.params.id} | IP: ${req.ip}`);
    await vocabularyController.update(req, res, next);
});

/**
 * @route   DELETE /api/vocabularies/:id
 * @desc    Xóa mềm từ vựng
 * @access  Private (Admin/Teacher)
 */
router.delete('/:id', async (req, res, next) => {
    logger.info(`[VocabularyRoute] [DELETE /vocabularies/:id] Request | ID: ${req.params.id} | IP: ${req.ip}`);
    await vocabularyController.delete(req, res, next);
});

/**
 * @route   DELETE /api/vocabularies/:id/hard
 * @desc    Xóa cứng từ vựng (xóa vĩnh viễn)
 * @access  Private (Admin only)
 */
router.delete('/:id/hard', async (req, res, next) => {
    logger.info(`[VocabularyRoute] [DELETE /vocabularies/:id/hard] Request HARD DELETE | ID: ${req.params.id} | IP: ${req.ip}`);
    await vocabularyController.hardDelete(req, res, next);
});

logger.info('[VocabularyRoute] Khởi tạo vocabulary routes thành công');

module.exports = router;
