const { prisma } = require('../../../config/prisma');
const logger = require('../../../utils/logger');

/**
 * Repository cho Vocabulary sử dụng Prisma
 */
class VocabularyRepository {
    /**
     * Lấy danh sách từ vựng với filter và pagination
     */
    async findAll({ page, limit, search, type, topic, sortBy, order }) {
        logger.info(`[VocabularyRepository] [findAll] Bắt đầu | Page: ${page}, Limit: ${limit}, Search: ${search}, Type: ${type}, Topic: ${topic}`);
        
        const where = {
            deleted_at: null
        };

        // Filter theo search term (tìm trong word và meaning_vi)
        if (search) {
            where.OR = [
                { word: { contains: search, mode: 'insensitive' } },
                { meaning_vi: { contains: search, mode: 'insensitive' } }
            ];
            logger.info(`[VocabularyRepository] [findAll] Áp dụng filter search: ${search}`);
        }

        // Filter theo type
        if (type) {
            where.type = type;
            logger.info(`[VocabularyRepository] [findAll] Áp dụng filter type: ${type}`);
        }

        // Filter theo topic
        if (topic) {
            where.topic = { equals: topic, mode: 'insensitive' };
            logger.info(`[VocabularyRepository] [findAll] Áp dụng filter topic: ${topic}`);
        }

        const skip = (page - 1) * limit;
        logger.info(`[VocabularyRepository] [findAll] Skip: ${skip}, Take: ${limit}`);

        // Đếm tổng số records
        const totalCount = await prisma.vocabulary.count({ where });
        logger.info(`[VocabularyRepository] [findAll] Tổng số records: ${totalCount}`);

        // Lấy danh sách
        const vocabularies = await prisma.vocabulary.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                [sortBy]: order
            },
            include: {
                users: {
                    select: {
                        id: true,
                        username: true
                    }
                }
            }
        });

        logger.info(`[VocabularyRepository] [findAll] Lấy thành công ${vocabularies.length} records`);
        return {
            data: vocabularies,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        };
    }

    /**
     * Lấy từ vựng theo ID
     */
    async findById(id) {
        logger.info(`[VocabularyRepository] [findById] Bắt đầu | ID: ${id}`);
        
        const vocabulary = await prisma.vocabulary.findUnique({
            where: {
                id,
                deleted_at: null
            },
            include: {
                users: {
                    select: {
                        id: true,
                        username: true
                    }
                }
            }
        });

        if (vocabulary) {
            logger.info(`[VocabularyRepository] [findById] Tìm thấy | ID: ${id} | Word: ${vocabulary.word}`);
        } else {
            logger.warn(`[VocabularyRepository] [findById] Không tìm thấy | ID: ${id}`);
        }

        return vocabulary;
    }

    /**
     * Lấy từ vựng theo word (unique)
     */
    async findByWord(word) {
        logger.info(`[VocabularyRepository] [findByWord] Bắt đầu | Word: ${word}`);
        
        const vocabulary = await prisma.vocabulary.findUnique({
            where: {
                word,
                deleted_at: null
            }
        });

        if (vocabulary) {
            logger.info(`[VocabularyRepository] [findByWord] Tìm thấy | Word: ${word} | ID: ${vocabulary.id}`);
        } else {
            logger.warn(`[VocabularyRepository] [findByWord] Không tìm thấy | Word: ${word}`);
        }

        return vocabulary;
    }

    /**
     * Kiểm tra từ vựng đã tồn tại chưa (không phân biệt hoa thường)
     */
    async existsByWord(word) {
        logger.info(`[VocabularyRepository] [existsByWord] Kiểm tra | Word: ${word}`);
        
        const count = await prisma.vocabulary.count({
            where: {
                word: { equals: word, mode: 'insensitive' },
                deleted_at: null
            }
        });
        
        const exists = count > 0;
        logger.info(`[VocabularyRepository] [existsByWord] Kết quả | Word: ${word} | Exists: ${exists}`);
        return exists;
    }

    /**
     * Tạo mới từ vựng
     */
    async create(data) {
        logger.info(`[VocabularyRepository] [create] Bắt đầu | Word: ${data.word}`);
        
        const created = await prisma.vocabulary.create({
            data: {
                ...data,
                created_at: new Date(),
                updated_at: new Date()
            },
            include: {
                users: {
                    select: {
                        id: true,
                        username: true
                    }
                }
            }
        });

        logger.info(`[VocabularyRepository] [create] Thành công | ID: ${created.id} | Word: ${created.word}`);
        return created;
    }

    /**
     * Cập nhật từ vựng
     */
    async update(id, data) {
        logger.info(`[VocabularyRepository] [update] Bắt đầu | ID: ${id} | Data: ${JSON.stringify(data)}`);
        
        const updated = await prisma.vocabulary.update({
            where: { id },
            data: {
                ...data,
                updated_at: new Date()
            },
            include: {
                users: {
                    select: {
                        id: true,
                        username: true
                    }
                }
            }
        });

        logger.info(`[VocabularyRepository] [update] Thành công | ID: ${id} | Word: ${updated.word}`);
        return updated;
    }

    /**
     * Xóa mềm từ vựng (soft delete)
     */
    async softDelete(id) {
        logger.info(`[VocabularyRepository] [softDelete] Bắt đầu | ID: ${id}`);
        
        const deleted = await prisma.vocabulary.update({
            where: { id },
            data: {
                deleted_at: new Date(),
                updated_at: new Date()
            }
        });

        logger.info(`[VocabularyRepository] [softDelete] Thành công | ID: ${id}`);
        return deleted;
    }

    /**
     * Xóa cứng từ vựng (hard delete)
     */
    async delete(id) {
        logger.info(`[VocabularyRepository] [delete] Bắt đầu xóa cứng | ID: ${id}`);
        
        const deleted = await prisma.vocabulary.delete({
            where: { id }
        });

        logger.info(`[VocabularyRepository] [delete] Xóa cứng thành công | ID: ${id}`);
        return deleted;
    }

    /**
     * Lấy tất cả topics (distinct)
     */
    async getAllTopics() {
        logger.info('[VocabularyRepository] [getAllTopics] Bắt đầu lấy danh sách topics');
        
        const topics = await prisma.vocabulary.findMany({
            where: {
                deleted_at: null,
                topic: { not: null }
            },
            select: {
                topic: true
            },
            distinct: ['topic']
        });
        
        const result = topics.map(t => t.topic);
        logger.info(`[VocabularyRepository] [getAllTopics] Hoàn thành | Số lượng: ${result.length}`);
        return result;
    }

    /**
     * Lấy từ vựng theo IDs (dùng cho batch operations)
     */
    async findByIds(ids) {
        logger.info(`[VocabularyRepository] [findByIds] Bắt đầu | IDs: ${JSON.stringify(ids)}`);
        
        const vocabularies = await prisma.vocabulary.findMany({
            where: {
                id: { in: ids },
                deleted_at: null
            }
        });

        logger.info(`[VocabularyRepository] [findByIds] Hoàn thành | Tìm thấy: ${vocabularies.length}/${ids.length}`);
        return vocabularies;
    }
}

module.exports = new VocabularyRepository();
