const vocabularyService = require('../service/vocabulary.service');
const logger = require('../../../utils/logger');

/**
 * Controller xử lý HTTP requests cho Vocabulary
 * Chỉ đơn giản là gọi Service và trả về response, 
 * mọi validation và error handling đều ở Service
 */
class VocabularyController {
    /**
     * GET /api/vocabularies
     * Lấy danh sách từ vựng
     */
    async getAll(req, res, next) {
        try {
            logger.info(`[VocabularyController] [getAll] Bắt đầu | Query: ${JSON.stringify(req.query)}`);

            const result = await vocabularyService.getAllVocabularies(req.query);

            logger.info(`[VocabularyController] [getAll] Thành công | Tổng: ${result.pagination.totalCount}`);
            return res.status(200).json({
                success: true,
                data: result.data,
                pagination: result.pagination
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * GET /api/vocabularies/:id
     * Lấy chi tiết từ vựng
     */
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            logger.info(`[VocabularyController] [getById] Bắt đầu | ID: ${id}`);

            const vocabulary = await vocabularyService.getVocabularyById(id);

            logger.info(`[VocabularyController] [getById] Thành công | ID: ${id}`);
            return res.status(200).json({
                success: true,
                data: vocabulary
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * GET /api/vocabularies/search
     * Tìm kiếm từ vựng theo word
     */
    async searchByWord(req, res, next) {
        try {
            const { word } = req.query;
            logger.info(`[VocabularyController] [searchByWord] Bắt đầu | Word: ${word}`);

            const vocabulary = await vocabularyService.getVocabularyByWord(word);

            logger.info(`[VocabularyController] [searchByWord] Thành công | Word: ${word}`);
            return res.status(200).json({
                success: true,
                data: vocabulary
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * POST /api/vocabularies
     * Tạo mới từ vựng
     */
    async create(req, res, next) {
        try {
            logger.info(`[VocabularyController] [create] Bắt đầu | Data: ${JSON.stringify(req.body)}`);

            const vocabulary = await vocabularyService.createVocabulary(req.body);

            logger.info(`[VocabularyController] [create] Thành công | ID: ${vocabulary.id}`);
            return res.status(201).json({
                success: true,
                message: 'Tạo từ vựng thành công',
                data: vocabulary
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * POST /api/vocabularies/batch
     * Tạo nhiều từ vựng cùng lúc
     */
    async createBatch(req, res, next) {
        try {
            const { items, created_by } = req.body;
            logger.info(`[VocabularyController] [createBatch] Bắt đầu | Số lượng: ${items?.length || 0}`);

            const result = await vocabularyService.createManyVocabularies(items, created_by);

            logger.info(`[VocabularyController] [createBatch] Thành công | Tạo: ${result.success.length} | Lỗi: ${result.errors.length}`);
            return res.status(201).json({
                success: true,
                message: `Đã tạo ${result.success.length} từ vựng, ${result.errors.length} lỗi`,
                data: result
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * PUT /api/vocabularies/:id
     * Cập nhật từ vựng
     */
    async update(req, res, next) {
        try {
            const { id } = req.params;
            logger.info(`[VocabularyController] [update] Bắt đầu | ID: ${id}`);

            const vocabulary = await vocabularyService.updateVocabulary(id, req.body);

            logger.info(`[VocabularyController] [update] Thành công | ID: ${id}`);
            return res.status(200).json({
                success: true,
                message: 'Cập nhật từ vựng thành công',
                data: vocabulary
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * DELETE /api/vocabularies/:id
     * Xóa mềm từ vựng
     */
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            logger.info(`[VocabularyController] [delete] Bắt đầu | ID: ${id}`);

            await vocabularyService.softDeleteVocabulary(id);

            logger.info(`[VocabularyController] [delete] Thành công | ID: ${id}`);
            return res.status(200).json({
                success: true,
                message: 'Xóa từ vựng thành công'
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * DELETE /api/vocabularies/:id/hard
     * Xóa cứng từ vựng (chỉ admin)
     */
    async hardDelete(req, res, next) {
        try {
            const { id } = req.params;
            logger.info(`[VocabularyController] [hardDelete] Bắt đầu | ID: ${id}`);

            await vocabularyService.hardDeleteVocabulary(id);

            logger.info(`[VocabularyController] [hardDelete] Thành công | ID: ${id}`);
            return res.status(200).json({
                success: true,
                message: 'Xóa từ vựng vĩnh viễn thành công'
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * GET /api/vocabularies/topics
     * Lấy danh sách tất cả topics
     */
    async getTopics(req, res, next) {
        try {
            logger.info('[VocabularyController] [getTopics] Bắt đầu');

            const topics = await vocabularyService.getAllTopics();

            logger.info(`[VocabularyController] [getTopics] Thành công | Số lượng: ${topics.length}`);
            return res.status(200).json({
                success: true,
                data: topics
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new VocabularyController();
