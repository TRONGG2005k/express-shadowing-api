const { prisma } = require('../../../config/prisma');
const logger = require('../../../utils/logger');

/**
 * Repository cho Authentication
 */
class AuthRepository {
    /**
     * Tìm user theo số điện thoại (bao gồm password_hash)
     */
    async findUserByPhone(phone) {
        logger.info(`[AuthRepository] [findUserByPhone] Bắt đầu | Phone: ${phone}`);

        const user = await prisma.users.findFirst({
            where: {
                phone,
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
            logger.info(`[AuthRepository] [findUserByPhone] Tìm thấy | Phone: ${phone} | ID: ${user.id}`);
        } else {
            logger.warn(`[AuthRepository] [findUserByPhone] Không tìm thấy | Phone: ${phone}`);
        }

        return user;
    }

    /**
     * Tìm user theo ID (không bao gồm password_hash)
     */
    async findUserById(id) {
        logger.info(`[AuthRepository] [findUserById] Bắt đầu | ID: ${id}`);

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
            logger.info(`[AuthRepository] [findUserById] Tìm thấy | ID: ${id}`);
        } else {
            logger.warn(`[AuthRepository] [findUserById] Không tìm thấy | ID: ${id}`);
        }

        return user;
    }

    /**
     * Tìm refresh token theo jtid
     */
    async findRefreshTokenByJtid(jtid) {
        logger.info(`[AuthRepository] [findRefreshTokenByJtid] Bắt đầu | JTID: ${jtid}`);

        const token = await prisma.refresh_token.findUnique({
            where: { jtid },
            include: {
                user: true
            }
        });

        if (token) {
            logger.info(`[AuthRepository] [findRefreshTokenByJtid] Tìm thấy | JTID: ${jtid}`);
        } else {
            logger.warn(`[AuthRepository] [findRefreshTokenByJtid] Không tìm thấy | JTID: ${jtid}`);
        }

        return token;
    }

    /**
     * Tạo mới refresh token
     */
    async createRefreshToken({ jtid, token, userId, expiresAt }) {
        logger.info(`[AuthRepository] [createRefreshToken] Bắt đầu | UserID: ${userId} | JTID: ${jtid}`);

        const created = await prisma.refresh_token.create({
            data: {
                jtid,
                token,
                user_id: userId,
                expires_at: expiresAt,
                created_at: new Date(),
                updated_at: new Date()
            }
        });

        logger.info(`[AuthRepository] [createRefreshToken] Thành công | ID: ${created.id} | JTID: ${jtid}`);
        return created;
    }

    /**
     * Xóa refresh token theo jtid
     */
    async deleteRefreshTokenByJtid(jtid) {
        logger.info(`[AuthRepository] [deleteRefreshTokenByJtid] Bắt đầu | JTID: ${jtid}`);

        try {
            await prisma.refresh_token.delete({
                where: { jtid }
            });
            logger.info(`[AuthRepository] [deleteRefreshTokenByJtid] Thành công | JTID: ${jtid}`);
            return true;
        } catch (error) {
            logger.warn(`[AuthRepository] [deleteRefreshTokenByJtid] Không tìm thấy để xóa | JTID: ${jtid}`);
            return false;
        }
    }

    /**
     * Xóa tất cả refresh tokens của user
     */
    async deleteAllRefreshTokensByUserId(userId) {
        logger.info(`[AuthRepository] [deleteAllRefreshTokensByUserId] Bắt đầu | UserID: ${userId}`);

        const result = await prisma.refresh_token.deleteMany({
            where: { user_id: userId }
        });

        logger.info(`[AuthRepository] [deleteAllRefreshTokensByUserId] Thành công | Deleted: ${result.count} tokens`);
        return result.count;
    }

    /**
     * Xóa các refresh token đã hết hạn
     */
    async deleteExpiredRefreshTokens() {
        logger.info(`[AuthRepository] [deleteExpiredRefreshTokens] Bắt đầu`);

        const result = await prisma.refresh_token.deleteMany({
            where: {
                expires_at: {
                    lt: new Date()
                }
            }
        });

        logger.info(`[AuthRepository] [deleteExpiredRefreshTokens] Thành công | Deleted: ${result.count} tokens`);
        return result.count;
    }

    /**
     * Cập nhật mật khẩu
     */
    async updatePassword(userId, passwordHash) {
        logger.info(`[AuthRepository] [updatePassword] Bắt đầu | UserID: ${userId}`);

        const updated = await prisma.users.update({
            where: { id: userId },
            data: {
                password_hash: passwordHash,
                updated_at: new Date()
            },
            select: {
                id: true,
                username: true,
                phone: true,
                role: true,
                is_active: true,
                updated_at: true
            }
        });

        logger.info(`[AuthRepository] [updatePassword] Thành công | UserID: ${userId}`);
        return updated;
    }

    /**
     * Tạo user mới (đăng ký)
     */
    async createUser({ username, phone, passwordHash, role }) {
        logger.info(`[AuthRepository] [createUser] Bắt đầu | Phone: ${phone}`);

        const user = await prisma.users.create({
            data: {
                username,
                phone,
                password_hash: passwordHash,
                role,
                is_active: true,
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

        logger.info(`[AuthRepository] [createUser] Thành công | UserID: ${user.id}`);
        return user;
    }

    /**
     * Kiểm tra số điện thoại đã tồn tại chưa
     */
    async checkPhoneExists(phone) {
        logger.info(`[AuthRepository] [checkPhoneExists] Bắt đầu | Phone: ${phone}`);

        const count = await prisma.users.count({
            where: {
                phone,
                deleted_at: null
            }
        });

        const exists = count > 0;
        logger.info(`[AuthRepository] [checkPhoneExists] Kết quả | Phone: ${phone} | Exists: ${exists}`);
        return exists;
    }
}

module.exports = new AuthRepository();
