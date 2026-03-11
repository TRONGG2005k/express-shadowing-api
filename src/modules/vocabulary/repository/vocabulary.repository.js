const { prisma } = require('../../../config/prisma');

/**
 * Repository cho Vocabulary sử dụng Prisma
 */
class VocabularyRepository {
    /**
     * Lấy danh sách từ vựng với filter và pagination
     */
    async findAll({ page, limit, search, type, topic, sortBy, order }) {
        const where = {
            deleted_at: null
        };

        // Filter theo search term (tìm trong word và meaning_vi)
        if (search) {
            where.OR = [
                { word: { contains: search, mode: 'insensitive' } },
                { meaning_vi: { contains: search, mode: 'insensitive' } }
            ];
        }

        // Filter theo type
        if (type) {
            where.type = type;
        }

        // Filter theo topic
        if (topic) {
            where.topic = { equals: topic, mode: 'insensitive' };
        }

        const skip = (page - 1) * limit;

        // Đếm tổng số records
        const totalCount = await prisma.vocabulary.count({ where });

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
        return prisma.vocabulary.findUnique({
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
    }

    /**
     * Lấy từ vựng theo word (unique)
     */
    async findByWord(word) {
        return prisma.vocabulary.findUnique({
            where: {
                word,
                deleted_at: null
            }
        });
    }

    /**
     * Kiểm tra từ vựng đã tồn tại chưa (không phân biệt hoa thường)
     */
    async existsByWord(word) {
        const count = await prisma.vocabulary.count({
            where: {
                word: { equals: word, mode: 'insensitive' },
                deleted_at: null
            }
        });
        return count > 0;
    }

    /**
     * Tạo mới từ vựng
     */
    async create(data) {
        return prisma.vocabulary.create({
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
    }

    /**
     * Cập nhật từ vựng
     */
    async update(id, data) {
        return prisma.vocabulary.update({
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
    }

    /**
     * Xóa mềm từ vựng (soft delete)
     */
    async softDelete(id) {
        return prisma.vocabulary.update({
            where: { id },
            data: {
                deleted_at: new Date(),
                updated_at: new Date()
            }
        });
    }

    /**
     * Xóa cứng từ vựng (hard delete)
     */
    async delete(id) {
        return prisma.vocabulary.delete({
            where: { id }
        });
    }

    /**
     * Lấy tất cả topics (distinct)
     */
    async getAllTopics() {
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
        return topics.map(t => t.topic);
    }

    /**
     * Lấy từ vựng theo IDs (dùng cho batch operations)
     */
    async findByIds(ids) {
        return prisma.vocabulary.findMany({
            where: {
                id: { in: ids },
                deleted_at: null
            }
        });
    }
}

module.exports = new VocabularyRepository();
