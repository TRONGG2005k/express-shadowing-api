const vocabularyRepository = require('../repository/vocabulary.repository');
const { CreateVocabularyDto, UpdateVocabularyDto, VocabularyQueryDto } = require('../dto/create-vocabulary.dto');

/**
 * Service xử lý business logic cho Vocabulary
 */
class VocabularyService {
    /**
     * Lấy danh sách từ vựng
     */
    async getAllVocabularies(query) {
        // Validate query params
        const validatedQuery = VocabularyQueryDto.parse(query);
        
        return vocabularyRepository.findAll(validatedQuery);
    }

    /**
     * Lấy từ vựng theo ID
     */
    async getVocabularyById(id) {
        const vocabulary = await vocabularyRepository.findById(id);
        
        if (!vocabulary) {
            throw new Error('Vocabulary not found');
        }
        
        return vocabulary;
    }

    /**
     * Lấy từ vựng theo word
     */
    async getVocabularyByWord(word) {
        return vocabularyRepository.findByWord(word);
    }

    /**
     * Tạo mới từ vựng
     */
    async createVocabulary(data) {
        // Validate data
        const validatedData = CreateVocabularyDto.parse(data);
        
        // Kiểm tra word đã tồn tại chưa
        const exists = await vocabularyRepository.existsByWord(validatedData.word);
        if (exists) {
            throw new Error(`Từ vựng "${validatedData.word}" đã tồn tại`);
        }
        
        return vocabularyRepository.create(validatedData);
    }

    /**
     * Cập nhật từ vựng
     */
    async updateVocabulary(id, data) {
        // Validate data
        const validatedData = UpdateVocabularyDto.parse(data);
        
        // Kiểm tra từ vựng có tồn tại không
        const existing = await vocabularyRepository.findById(id);
        if (!existing) {
            throw new Error('Vocabulary not found');
        }
        
        // Nếu cập nhật word, kiểm tra word mới đã tồn tại chưa
        if (validatedData.word && validatedData.word !== existing.word) {
            const exists = await vocabularyRepository.existsByWord(validatedData.word);
            if (exists) {
                throw new Error(`Từ vựng "${validatedData.word}" đã tồn tại`);
            }
        }
        
        return vocabularyRepository.update(id, validatedData);
    }

    /**
     * Xóa mềm từ vựng
     */
    async softDeleteVocabulary(id) {
        // Kiểm tra từ vựng có tồn tại không
        const existing = await vocabularyRepository.findById(id);
        if (!existing) {
            throw new Error('Vocabulary not found');
        }
        
        return vocabularyRepository.softDelete(id);
    }

    /**
     * Xóa cứng từ vựng (chỉ dùng cho admin)
     */
    async hardDeleteVocabulary(id) {
        // Kiểm tra từ vựng có tồn tại không
        const existing = await vocabularyRepository.findById(id);
        if (!existing) {
            throw new Error('Vocabulary not found');
        }
        
        // TODO: Kiểm tra từ vựng có đang được sử dụng trong bài tập không
        // if (existing.vocabulary_question_detail?.length > 0) {
        //     throw new Error('Không thể xóa từ vựng đang được sử dụng trong bài tập');
        // }
        
        return vocabularyRepository.delete(id);
    }

    /**
     * Lấy danh sách tất cả topics
     */
    async getAllTopics() {
        return vocabularyRepository.getAllTopics();
    }

    /**
     * Tạo nhiều từ vựng cùng lúc (batch create)
     */
    async createManyVocabularies(items, createdBy) {
        if (!Array.isArray(items) || items.length === 0) {
            throw new Error('Danh sách từ vựng không hợp lệ');
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

        return results;
    }
}

module.exports = new VocabularyService();
