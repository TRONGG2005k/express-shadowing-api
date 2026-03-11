const express = require('express');
const vocabularyController = require('./controller/vocabulary.controller');

const router = express.Router();

/**
 * @route   GET /api/vocabularies
 * @desc    Lấy danh sách từ vựng (có filter, pagination)
 * @query   {number} page - Trang hiện tại (default: 1)
 * @query   {number} limit - Số item mỗi trang (default: 10, max: 100)
 * @query   {string} search - Từ khóa tìm kiếm (tìm trong word và meaning_vi)
 * @query   {string} type - Loại từ: noun, verb, adjective, adverb, phrase
 * @query   {string} topic - Chủ đề
 * @query   {string} sortBy - Sắp xếp theo: word, created_at, updated_at (default: created_at)
 * @query   {string} order - Thứ tự: asc, desc (default: desc)
 * @access  Public
 */
router.get('/', (req, res) => vocabularyController.getAll(req, res));

/**
 * @route   GET /api/vocabularies/topics
 * @desc    Lấy danh sách tất cả chủ đề (topics)
 * @access  Public
 */
router.get('/topics', (req, res) => vocabularyController.getTopics(req, res));

/**
 * @route   GET /api/vocabularies/search
 * @desc    Tìm kiếm từ vựng theo word chính xác
 * @query   {string} word - Từ cần tìm
 * @access  Public
 */
router.get('/search', (req, res) => vocabularyController.searchByWord(req, res));

/**
 * @route   POST /api/vocabularies/batch
 * @desc    Tạo nhiều từ vựng cùng lúc
 * @body    {array} items - Danh sách từ vựng
 * @body    {bigint} created_by - ID ngườI tạo
 * @access  Private (Admin/Teacher)
 */
router.post('/batch', (req, res) => vocabularyController.createBatch(req, res));

/**
 * @route   GET /api/vocabularies/:id
 * @desc    Lấy chi tiết từ vựng theo ID
 * @param   {bigint} id - ID từ vựng
 * @access  Public
 */
router.get('/:id', (req, res) => vocabularyController.getById(req, res));

/**
 * @route   POST /api/vocabularies
 * @desc    Tạo mới từ vựng
 * @body    {VocabularyCreate} data - Dữ liệu từ vựng
 * @access  Private (Admin/Teacher)
 */
router.post('/', (req, res) => vocabularyController.create(req, res));

/**
 * @route   PUT /api/vocabularies/:id
 * @desc    Cập nhật từ vựng
 * @param   {bigint} id - ID từ vựng
 * @body    {VocabularyUpdate} data - Dữ liệu cập nhật
 * @access  Private (Admin/Teacher)
 */
router.put('/:id', (req, res) => vocabularyController.update(req, res));

/**
 * @route   DELETE /api/vocabularies/:id
 * @desc    Xóa mềm từ vựng
 * @param   {bigint} id - ID từ vựng
 * @access  Private (Admin/Teacher)
 */
router.delete('/:id', (req, res) => vocabularyController.delete(req, res));

/**
 * @route   DELETE /api/vocabularies/:id/hard
 * @desc    Xóa cứng từ vựng (xóa vĩnh viễn)
 * @param   {bigint} id - ID từ vựng
 * @access  Private (Admin only)
 */
router.delete('/:id/hard', (req, res) => vocabularyController.hardDelete(req, res));

module.exports = router;
