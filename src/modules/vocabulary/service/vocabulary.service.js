const vocabularyRepository = require('../repository/vocabulary.repository');
const { CreateVocabularyDto, UpdateVocabularyDto, VocabularyQueryDto, VocabularyIdParamDto } = require('../dto/create-vocabulary.dto');
const AppException = require('../../../error/exception/AppException');
const errorMessages = require('../../../error/error.message');
const logger = require('../../../utils/logger');

/**
 * Service xử lý business logic cho Vocabulary
 * Tất cả validation và error handling đều ở đây
 */
class VocabularyService {
    /**
     * Lấy danh sách từ vựng
     */
    async getAllVocabularies(query) {
        logger.info(`[VocabularyService] [getAllVocabularies] Bắt đầu | Query: ${JSON.stringify(query)}`);

        // Validate query params
        const validatedQuery = VocabularyQueryDto.parse(query);

        const result = await vocabularyRepository.findAll(validatedQuery);

        logger.info(`[VocabularyService] [getAllVocabularies] Hoàn thành | Tổng: ${result.pagination.totalCount}`);
        return result;
    }

    /**
     * Lấy từ vựng theo ID
     */
    async getVocabularyById(id) {
        logger.info(`[VocabularyService] [getVocabularyById] Bắt đầu | ID: ${id}`);

        // Validate ID
        VocabularyIdParamDto.parse({ id });

        const vocabulary = await vocabularyRepository.findById(id);

        if (!vocabulary) {
            logger.warn(`[VocabularyService] [getVocabularyById] Không tìm thấy | ID: ${id}`);
            throw new AppException({
                ...errorMessages.NOT_FOUND,
                message: 'Không tìm thấy từ vựng'
            });
        }

        logger.info(`[VocabularyService] [getVocabularyById] Tìm thấy | ID: ${id}`);
        return vocabulary;
    }

    /**
     * Lấy từ vựng theo word
     */
    async getVocabularyByWord(word) {
        logger.info(`[VocabularyService] [getVocabularyByWord] Bắt đầu | Word: ${word}`);

        // Validate word param
        if (!word || word.trim() === '') {
            logger.warn('[VocabularyService] [getVocabularyByWord] Thiếu tham số từ khóa');
            throw new AppException({
                ...errorMessages.BAD_REQUEST,
                message: 'Thiếu tham số từ khóa tìm kiếm'
            });
        }

        const vocabulary = await vocabularyRepository.findByWord(word.trim());

        if (!vocabulary) {
            logger.warn(`[VocabularyService] [getVocabularyByWord] Không tìm thấy | Word: ${word}`);
            throw new AppException({
                ...errorMessages.NOT_FOUND,
                message: 'Không tìm thấy từ vựng'
            });
        }

        logger.info(`[VocabularyService] [getVocabularyByWord] Tìm thấy | Word: ${word} | ID: ${vocabulary.id}`);
        return vocabulary;
    }

    /**
     * Tạo mới từ vựng
     */
    async createVocabulary(data) {
        logger.info(`[VocabularyService] [createVocabulary] Bắt đầu | Word: ${data?.word}`);

        // Validate data
        const validatedData = CreateVocabularyDto.parse(data);

        // Kiểm tra word đã tồn tại chưa
        const exists = await vocabularyRepository.existsByWord(validatedData.word);
        if (exists) {
            logger.warn(`[VocabularyService] [createVocabulary] Đã tồn tại | Word: ${validatedData.word}`);
            throw new AppException({
                message: `Từ vựng "${validatedData.word}" đã tồn tại`,
                statusCode: 409,
                errorCode: 'E10004'
            });
        }

        const created = await vocabularyRepository.create(validatedData);

        logger.info(`[VocabularyService] [createVocabulary] Thành công | ID: ${created.id}`);
        return created;
    }

    /**
     * Cập nhật từ vựng
     */
    async updateVocabulary(id, data) {
        logger.info(`[VocabularyService] [updateVocabulary] Bắt đầu | ID: ${id}`);

        // Validate ID
        VocabularyIdParamDto.parse({ id });

        // Validate data
        const validatedData = UpdateVocabularyDto.parse(data);

        // Kiểm tra từ vựng có tồn tại không
        const existing = await vocabularyRepository.findById(id);
        if (!existing) {
            logger.warn(`[VocabularyService] [updateVocabulary] Không tìm thấy | ID: ${id}`);
            throw new AppException({
                ...errorMessages.NOT_FOUND,
                message: 'Không tìm thấy từ vựng'
            });
        }

        // Nếu cập nhật word, kiểm tra word mới đã tồn tại chưa
        if (validatedData.word && validatedData.word !== existing.word) {
            const exists = await vocabularyRepository.existsByWord(validatedData.word);
            if (exists) {
                logger.warn(`[VocabularyService] [updateVocabulary] Word mới đã tồn tại | Word: ${validatedData.word}`);
                throw new AppException({
                    message: `Từ vựng "${validatedData.word}" đã tồn tại`,
                    statusCode: 409,
                    errorCode: 'E10005'
                });
            }
        }

        const updated = await vocabularyRepository.update(id, validatedData);

        logger.info(`[VocabularyService] [updateVocabulary] Thành công | ID: ${id}`);
        return updated;
    }

    /**
     * Xóa mềm từ vựng
     */
    async softDeleteVocabulary(id) {
        logger.info(`[VocabularyService] [softDeleteVocabulary] Bắt đầu | ID: ${id}`);

        // Validate ID
        VocabularyIdParamDto.parse({ id });

        // Kiểm tra từ vựng có tồn tại không
        const existing = await vocabularyRepository.findById(id);
        if (!existing) {
            logger.warn(`[VocabularyService] [softDeleteVocabulary] Không tìm thấy | ID: ${id}`);
            throw new AppException({
                ...errorMessages.NOT_FOUND,
                message: 'Không tìm thấy từ vựng'
            });
        }

        await vocabularyRepository.softDelete(id);

        logger.info(`[VocabularyService] [softDeleteVocabulary] Thành công | ID: ${id}`);
        return true;
    }

    /**
     * Xóa cứng từ vựng (chỉ dùng cho admin)
     */
    async hardDeleteVocabulary(id) {
        logger.info(`[VocabularyService] [hardDeleteVocabulary] Bắt đầu | ID: ${id}`);

        // Validate ID
        VocabularyIdParamDto.parse({ id });

        // Kiểm tra từ vựng có tồn tại không
        const existing = await vocabularyRepository.findById(id);
        if (!existing) {
            logger.warn(`[VocabularyService] [hardDeleteVocabulary] Không tìm thấy | ID: ${id}`);
            throw new AppException({
                ...errorMessages.NOT_FOUND,
                message: 'Không tìm thấy từ vựng'
            });
        }

        await vocabularyRepository.delete(id);

        logger.info(`[VocabularyService] [hardDeleteVocabulary] Thành công | ID: ${id}`);
        return true;
    }

    /**
     * Lấy danh sách tất cả topics
     */
    async getAllTopics() {
        logger.info('[VocabularyService] [getAllTopics] Bắt đầu');

        const topics = await vocabularyRepository.getAllTopics();

        logger.info(`[VocabularyService] [getAllTopics] Hoàn thành | Số lượng: ${topics.length}`);
        return topics;
    }

    /**
     * Tạo nhiều từ vựng cùng lúc (batch create)
     */
    async createManyVocabularies(items, createdBy) {
        logger.info(`[VocabularyService] [createManyVocabularies] Bắt đầu | Số lượng: ${items?.length} | CreatedBy: ${createdBy}`);

        // Validate input
        if (!Array.isArray(items)) {
            logger.warn('[VocabularyService] [createManyVocabularies] Dữ liệu không phải mảng');
            throw new AppException({
                ...errorMessages.BAD_REQUEST,
                message: 'Dữ liệu phải là một mảng'
            });
        }

        if (!createdBy) {
            logger.warn('[VocabularyService] [createManyVocabularies] Thiếu thông tin ngườI tạo');
            throw new AppException({
                ...errorMessages.BAD_REQUEST,
                message: 'Thiếu thông tin ngườI tạo'
            });
        }

        if (items.length === 0) {
            logger.warn('[VocabularyService] [createManyVocabularies] Danh sách rỗng');
            throw new AppException({
                ...errorMessages.BAD_REQUEST,
                message: 'Danh sách từ vựng không hợp lệ'
            });
        }

        const results = {
            success: [],
            errors: []
        };

        for (const [index, item] of items.entries()) {
            try {
                // Thêm created_by vào mỗi item
                const data = { ...item, created_by: createdBy };
                const validatedData = CreateVocabularyDto.parse(data);

                // Kiểm tra từ đã tồn tại
                const exists = await vocabularyRepository.existsByWord(validatedData.word);
                if (exists) {
                    results.errors.push({
                        index,
                        word: item.word,
                        error: `Từ vựng "${item.word}" đã tồn tại`
                    });
                    continue;
                }

                const created = await vocabularyRepository.create(validatedData);
                results.success.push(created);
            } catch (error) {
                results.errors.push({
                    index,
                    word: item.word,
                    error: error.message || 'Lỗi không xác định'
                });
            }
        }

        logger.info(`[VocabularyService] [createManyVocabularies] Hoàn thành | Thành công: ${results.success.length} | Lỗi: ${results.errors.length}`);
        return results;
    }
}

module.exports = new VocabularyService();
