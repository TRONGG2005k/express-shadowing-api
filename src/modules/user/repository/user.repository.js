const { prisma } = require('../../../config/prisma');
const logger = require('../../../utils/logger');

/**
 * Repository cho User sử dụng Prisma
 */
class UserRepository {
    /**
     * Lấy danh sách users với filter và pagination
     */
    async findAll({ page, limit, search, role, is_active, sortBy, order }) {
        logger.info(`[UserRepository] [findAll] Bắt đầu | Page: ${page}, Limit: ${limit}, Search: ${search}, Role: ${role}`);

        const where = {
            deleted_at: null
        };

        // Filter theo search term (tìm trong username)
        if (search) {
            where.username = { contains: search, mode: 'insensitive' };
            logger.info(`[UserRepository] [findAll] Áp dụng filter search: ${search}`);
        }

        // Filter theo role
        if (role) {
            where.role = role;
            logger.info(`[UserRepository] [findAll] Áp dụng filter role: ${role}`);
        }

        // Filter theo is_active
        if (is_active !== undefined) {
            where.is_active = is_active;
            logger.info(`[UserRepository] [findAll] Áp dụng filter is_active: ${is_active}`);
        }

        const skip = (page - 1) * limit;
        logger.info(`[UserRepository] [findAll] Skip: ${skip}, Take: ${limit}`);

        // Đếm tổng số records
        const totalCount = await prisma.users.count({ where });
        logger.info(`[UserRepository] [findAll] Tổng số records: ${totalCount}`);

        // Lấy danh sách (không bao gồm password_hash)
        const users = await prisma.users.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                [sortBy]: order
            },
            select: {
                id: true,
                username: true,
                phone: true,
                role: true,
                ref_id: true,
                ref_type: true,
                is_active: true,
                created_at: true,
                updated_at: true
            }
        });

        logger.info(`[UserRepository] [findAll] Lấy thành công ${users.length} records`);
        return {
            data: users,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        };
    }

    /**
     * Lấy user theo ID
     */
    async findById(id) {
        logger.info(`[UserRepository] [findById] Bắt đầu | ID: ${id}`);

        const user = await prisma.users.findUnique({
            where: {
                id,
                deleted_at: null
            },
            select: {
                id: true,
                username: true,
                phone: true,
                role: true,
                ref_id: true,
                ref_type: true,
                is_active: true,
                created_at: true,
                updated_at: true
            }
        });

        if (user) {
            logger.info(`[UserRepository] [findById] Tìm thấy | ID: ${id} | Username: ${user.username}`);
        } else {
            logger.warn(`[UserRepository] [findById] Không tìm thấy | ID: ${id}`);
        }

        return user;
    }

    /**
     * Lấy user theo ID (bao gồm password_hash - dùng cho authentication)
     */
    async findByIdWithPassword(id) {
        logger.info(`[UserRepository] [findByIdWithPassword] Bắt đầu | ID: ${id}`);

        const user = await prisma.users.findUnique({
            where: {
                id,
                deleted_at: null
            }
        });

        if (user) {
            logger.info(`[UserRepository] [findByIdWithPassword] Tìm thấy | ID: ${id}`);
        } else {
            logger.warn(`[UserRepository] [findByIdWithPassword] Không tìm thấy | ID: ${id}`);
        }

        return user;
    }

    /**
     * Lấy user theo username
     */
    async findByUsername(username) {
        logger.info(`[UserRepository] [findByUsername] Bắt đầu | Username: ${username}`);

        const user = await prisma.users.findFirst({
            where: {
                username: { equals: username, mode: 'insensitive' },
                deleted_at: null
            },
            select: {
                id: true,
                username: true,
                phone: true,
                password_hash: true,
                role: true,
                ref_id: true,
                ref_type: true,
                is_active: true,
                created_at: true,
                updated_at: true
            }
        });

        if (user) {
            logger.info(`[UserRepository] [findByUsername] Tìm thấy | Username: ${username} | ID: ${user.id}`);
        } else {
            logger.warn(`[UserRepository] [findByUsername] Không tìm thấy | Username: ${username}`);
        }

        return user;
    }

    /**
     * Lấy user theo phone
     */
    async findByPhone(phone) {
        logger.info(`[UserRepository] [findByPhone] Bắt đầu | Phone: ${phone}`);

        const user = await prisma.users.findFirst({
            where: {
                phone,
                deleted_at: null
            },
            select: {
                id: true,
                username: true,
                phone: true,
                role: true,
                ref_id: true,
                ref_type: true,
                is_active: true,
                created_at: true,
                updated_at: true
            }
        });

        if (user) {
            logger.info(`[UserRepository] [findByPhone] Tìm thấy | Phone: ${phone} | ID: ${user.id}`);
        } else {
            logger.warn(`[UserRepository] [findByPhone] Không tìm thấy | Phone: ${phone}`);
        }

        return user;
    }

    /**
     * Kiểm tra username đã tồn tại chưa
     */
    async existsByUsername(username) {
        logger.info(`[UserRepository] [existsByUsername] Kiểm tra | Username: ${username}`);

        const count = await prisma.users.count({
            where: {
                username: { equals: username, mode: 'insensitive' },
                deleted_at: null
            }
        });

        const exists = count > 0;
        logger.info(`[UserRepository] [existsByUsername] Kết quả | Exists: ${exists}`);
        return exists;
    }

    /**
     * Kiểm tra phone đã tồn tại chưa
     */
    async existsByPhone(phone) {
        logger.info(`[UserRepository] [existsByPhone] Kiểm tra | Phone: ${phone}`);

        const count = await prisma.users.count({
            where: {
                phone,
                deleted_at: null
            }
        });

        const exists = count > 0;
        logger.info(`[UserRepository] [existsByPhone] Kết quả | Exists: ${exists}`);
        return exists;
    }

    /**
     * Kiểm tra username đã tồn tại chưa (trừ ID hiện tại - dùng cho update)
     */
    async existsByUsernameExcludingId(username, excludeId) {
        logger.info(`[UserRepository] [existsByUsernameExcludingId] Kiểm tra | Username: ${username}, ExcludeId: ${excludeId}`);

        const count = await prisma.users.count({
            where: {
                username: { equals: username, mode: 'insensitive' },
                deleted_at: null,
                id: { not: excludeId }
            }
        });

        const exists = count > 0;
        logger.info(`[UserRepository] [existsByUsernameExcludingId] Kết quả | Exists: ${exists}`);
        return exists;
    }

    /**
     * Kiểm tra phone đã tồn tại chưa (trừ ID hiện tại - dùng cho update)
     */
    async existsByPhoneExcludingId(phone, excludeId) {
        logger.info(`[UserRepository] [existsByPhoneExcludingId] Kiểm tra | Phone: ${phone}, ExcludeId: ${excludeId}`);

        const count = await prisma.users.count({
            where: {
                phone,
                deleted_at: null,
                id: { not: excludeId }
            }
        });

        const exists = count > 0;
        logger.info(`[UserRepository] [existsByPhoneExcludingId] Kết quả | Exists: ${exists}`);
        return exists;
    }

    /**
     * Tạo mới user
     */
    async create(data) {
        logger.info(`[UserRepository] [create] Bắt đầu | Username: ${data.username}`);

        const created = await prisma.users.create({
            data: {
                username: data.username,
                phone: data.phone,
                password_hash: data.password_hash || data.password, // Hash nên được xử lý ở service
                role: data.role,
                ref_id: data.ref_id || null,
                ref_type: data.ref_type || null,
                is_active: data.is_active !== undefined ? data.is_active : true,
                created_at: new Date(),
                updated_at: new Date()
            },
            select: {
                id: true,
                username: true,
                phone: true,
                role: true,
                ref_id: true,
                ref_type: true,
                is_active: true,
                created_at: true,
                updated_at: true
            }
        });

        logger.info(`[UserRepository] [create] Thành công | ID: ${created.id} | Username: ${created.username}`);
        return created;
    }

    /**
     * Cập nhật user
     */
    async update(id, data) {
        logger.info(`[UserRepository] [update] Bắt đầu | ID: ${id} | Data: ${JSON.stringify(data)}`);

        const updateData = {
            updated_at: new Date()
        };

        if (data.username !== undefined) {
            updateData.username = data.username;
        }
        if (data.phone !== undefined) {
            updateData.phone = data.phone;
        }
        if (data.password_hash !== undefined || data.password !== undefined) {
            updateData.password_hash = data.password_hash || data.password;
        }
        if (data.role !== undefined) {
            updateData.role = data.role;
        }
        if (data.ref_id !== undefined) {
            updateData.ref_id = data.ref_id;
        }
        if (data.ref_type !== undefined) {
            updateData.ref_type = data.ref_type;
        }
        if (data.is_active !== undefined) {
            updateData.is_active = data.is_active;
        }

        const updated = await prisma.users.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                username: true,
                phone: true,
                role: true,
                ref_id: true,
                ref_type: true,
                is_active: true,
                created_at: true,
                updated_at: true
            }
        });

        logger.info(`[UserRepository] [update] Thành công | ID: ${id} | Username: ${updated.username}`);
        return updated;
    }

    /**
     * Xóa mềm user (soft delete)
     */
    async softDelete(id) {
        logger.info(`[UserRepository] [softDelete] Bắt đầu | ID: ${id}`);

        const deleted = await prisma.users.update({
            where: { id },
            data: {
                deleted_at: new Date(),
                updated_at: new Date()
            }
        });

        logger.info(`[UserRepository] [softDelete] Thành công | ID: ${id}`);
        return deleted;
    }

    /**
     * Xóa cứng user (hard delete)
     */
    async delete(id) {
        logger.info(`[UserRepository] [delete] Bắt đầu xóa cứng | ID: ${id}`);

        const deleted = await prisma.users.delete({
            where: { id }
        });

        logger.info(`[UserRepository] [delete] Xóa cứng thành công | ID: ${id}`);
        return deleted;
    }
}

module.exports = new UserRepository();