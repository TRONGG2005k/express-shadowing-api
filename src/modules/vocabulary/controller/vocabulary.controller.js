const vocabularyService = require('../service/vocabulary.service');
const { VocabularyIdParamDto } = require('../dto/create-vocabulary.dto');
const { z } = require('zod');

/**
 * Controller xử lý HTTP requests cho Vocabulary
 */
class VocabularyController {
    /**
     * GET /api/vocabularies
     * Lấy danh sách từ vựng
     */
    async getAll(req, res) {
        try {
            const result = await vocabularyService.getAllVocabularies(req.query);
            return res.status(200).json({
                success: true,
                data: result.data,
                pagination: result.pagination
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Dữ liệu không hợp lệ',
                    errors: error.errors
                });
            }
            return res.status(500).json({
                success: false,
                message: error.message || 'Lỗi server'
            });
        }
    }

    /**
     * GET /api/vocabularies/:id
     * Lấy chi tiết từ vựng
     */
    async getById(req, res) {
        try {
            // Validate ID param
            const { id } = VocabularyIdParamDto.parse({ id: req.params.id });
            
            const vocabulary = await vocabularyService.getVocabularyById(id);
            return res.status(200).json({
                success: true,
                data: vocabulary
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'ID không hợp lệ',
                    errors: error.errors
                });
            }
            if (error.message === 'Vocabulary not found') {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy từ vựng'
                });
            }
            return res.status(500).json({
                success: false,
                message: error.message || 'Lỗi server'
            });
        }
    }

    /**
     * GET /api/vocabularies/search
     * Tìm kiếm từ vựng theo word
     */
    async searchByWord(req, res) {
        try {
            const { word } = req.query;
            
            if (!word) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu tham số từ khóa tìm kiếm'
                });
            }

            const vocabulary = await vocabularyService.getVocabularyByWord(word);
            
            if (!vocabulary) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy từ vựng'
                });
            }

            return res.status(200).json({
                success: true,
                data: vocabulary
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Lỗi server'
            });
        }
    }

    /**
     * POST /api/vocabularies
     * Tạo mới từ vựng
     */
    async create(req, res) {
        try {
            const vocabulary = await vocabularyService.createVocabulary(req.body);
            return res.status(201).json({
                success: true,
                message: 'Tạo từ vựng thành công',
                data: vocabulary
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Dữ liệu không hợp lệ',
                    errors: error.errors
                });
            }
            if (error.message.includes('đã tồn tại')) {
                return res.status(409).json({
                    success: false,
                    message: error.message
                });
            }
            return res.status(500).json({
                success: false,
                message: error.message || 'Lỗi server'
            });
        }
    }

    /**
     * POST /api/vocabularies/batch
     * Tạo nhiều từ vựng cùng lúc
     */
    async createBatch(req, res) {
        try {
            const { items, created_by } = req.body;

            if (!Array.isArray(items)) {
                return res.status(400).json({
                    success: false,
                    message: 'Dữ liệu phảI là một mảng'
                });
            }

            if (!created_by) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu thông tin ngườI tạo'
                });
            }

            const result = await vocabularyService.createManyVocabularies(items, created_by);
            
            return res.status(201).json({
                success: true,
                message: `Đã tạo ${result.success.length} từ vựng, ${result.errors.length} lỗi`,
                data: result
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Lỗi server'
            });
        }
    }

    /**
     * PUT /api/vocabularies/:id
     * Cập nhật từ vựng
     */
    async update(req, res) {
        try {
            // Validate ID param
            const { id } = VocabularyIdParamDto.parse({ id: req.params.id });
            
            const vocabulary = await vocabularyService.updateVocabulary(id, req.body);
            return res.status(200).json({
                success: true,
                message: 'Cập nhật từ vựng thành công',
                data: vocabulary
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Dữ liệu không hợp lệ',
                    errors: error.errors
                });
            }
            if (error.message === 'Vocabulary not found') {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy từ vựng'
                });
            }
            if (error.message.includes('đã tồn tại')) {
                return res.status(409).json({
                    success: false,
                    message: error.message
                });
            }
            return res.status(500).json({
                success: false,
                message: error.message || 'Lỗi server'
            });
        }
    }

    /**
     * DELETE /api/vocabularies/:id
     * Xóa mềm từ vựng
     */
    async delete(req, res) {
        try {
            // Validate ID param
            const { id } = VocabularyIdParamDto.parse({ id: req.params.id });
            
            await vocabularyService.softDeleteVocabulary(id);
            return res.status(200).json({
                success: true,
                message: 'Xóa từ vựng thành công'
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'ID không hợp lệ',
                    errors: error.errors
                });
            }
            if (error.message === 'Vocabulary not found') {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy từ vựng'
                });
            }
            return res.status(500).json({
                success: false,
                message: error.message || 'Lỗi server'
            });
        }
    }

    /**
     * DELETE /api/vocabularies/:id/hard
     * Xóa cứng từ vựng (chỉ admin)
     */
    async hardDelete(req, res) {
        try {
            // Validate ID param
            const { id } = VocabularyIdParamDto.parse({ id: req.params.id });
            
            await vocabularyService.hardDeleteVocabulary(id);
            return res.status(200).json({
                success: true,
                message: 'Xóa từ vựng vĩnh viễn thành công'
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'ID không hợp lệ',
                    errors: error.errors
                });
            }
            if (error.message === 'Vocabulary not found') {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy từ vựng'
                });
            }
            return res.status(500).json({
                success: false,
                message: error.message || 'Lỗi server'
            });
        }
    }

    /**
     * GET /api/vocabularies/topics
     * Lấy danh sách tất cả topics
     */
    async getTopics(req, res) {
        try {
            const topics = await vocabularyService.getAllTopics();
            return res.status(200).json({
                success: true,
                data: topics
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Lỗi server'
            });
        }
    }
}

module.exports = new VocabularyController();
