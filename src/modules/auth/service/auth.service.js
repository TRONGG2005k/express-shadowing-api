const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const authRepository = require('../repository/auth.repository');
const { RegisterDto, LoginDto } = require('../dto/auth.dto');
const authConfig = require('../../../config/auth.config');
const AppException = require('../../../error/exception/AppException');
const logger = require('../../../utils/logger');

/**
 * Service xử lý business logic cho Authentication
 */
class AuthService {
    /**
     * Đăng ký tài khoản mới
     * @param {Object} data - { username, phone, password, role }
     * @returns {Object} - { user, accessToken, refreshToken }
     */
    async register(data) {
        logger.info(`[AuthService] [register] Bắt đầu | Phone: ${data?.phone}`);

        // Validate input
        const validatedData = RegisterDto.parse(data);

        // Kiểm tra số điện thoại đã tồn tại chưa
        const phoneExists = await authRepository.checkPhoneExists(validatedData.phone);
        if (phoneExists) {
            logger.warn(`[AuthService] [register] Số điện thoại đã tồn tại | Phone: ${validatedData.phone}`);
            throw new AppException({
                message: 'Số điện thoại đã được sử dụng',
                statusCode: 409,
                errorCode: 'E20010'
            });
        }

        // Hash mật khẩu
        const passwordHash = await this.hashPassword(validatedData.password);

        // Tạo user mới
        const user = await authRepository.createUser({
            username: validatedData.username,
            phone: validatedData.phone,
            passwordHash,
            role: validatedData.role
        });

        // Tạo tokens
        const tokens = await this.generateTokenPair(user);

        logger.info(`[AuthService] [register] Thành công | UserID: ${user.id}`);
        return {
            user,
            ...tokens
        };
    }

    /**
     * Đăng nhập
     * @param {Object} credentials - { phone, password }
     * @returns {Object} - { user, accessToken, refreshToken }
     */
    async login(credentials) {
        logger.info(`[AuthService] [login] Bắt đầu | Phone: ${credentials?.phone}`);

        // Validate input
        const validatedData = LoginDto.parse(credentials);

        // Tìm user theo phone
        const user = await authRepository.findUserByPhone(validatedData.phone);
        if (!user) {
            logger.warn(`[AuthService] [login] Số điện thoại không tồn tại | Phone: ${validatedData.phone}`);
            throw new AppException({
                message: 'Số điện thoại hoặc mật khẩu không đúng',
                statusCode: 401,
                errorCode: 'E20001'
            });
        }

        // Kiểm tra user có active không
        if (!user.is_active) {
            logger.warn(`[AuthService] [login] Tài khoản bị vô hiệu hóa | UserID: ${user.id}`);
            throw new AppException({
                message: 'Tài khoản đã bị vô hiệu hóa',
                statusCode: 403,
                errorCode: 'E20002'
            });
        }

        // Kiểm tra mật khẩu
        const isPasswordValid = await bcrypt.compare(validatedData.password, user.password_hash);
        if (!isPasswordValid) {
            logger.warn(`[AuthService] [login] Mật khẩu không đúng | UserID: ${user.id}`);
            throw new AppException({
                message: 'Số điện thoại hoặc mật khẩu không đúng',
                statusCode: 401,
                errorCode: 'E20001'
            });
        }

        // Tạo tokens
        const tokens = await this.generateTokenPair(user);

        // Xóa password_hash khỏi response
        const { password_hash, ...userWithoutPassword } = user;

        logger.info(`[AuthService] [login] Thành công | UserID: ${user.id}`);
        return {
            user: userWithoutPassword,
            ...tokens
        };
    }

    /**
     * Tạo cặp token mới (Access Token + Refresh Token)
     * @param {Object} user - User object
     * @returns {Object} - { accessToken, refreshToken }
     */
    async generateTokenPair(user) {
        logger.info(`[AuthService] [generateTokenPair] Bắt đầu | UserID: ${user.id}`);

        // Payload cho access token
        const accessTokenPayload = {
            userId: user.id,
            username: user.phone, // Sử dụng phone làm username
            role: user.role,
            type: 'access'
        };

        // Payload cho refresh token
        const jtid = uuidv4(); // JWT ID unique cho refresh token
        const refreshTokenPayload = {
            userId: user.id,
            username: user.phone,
            role: user.role,
            type: 'refresh',
            jtid
        };

        // Tạo access token
        const accessToken = jwt.sign(
            accessTokenPayload,
            authConfig.jwt.accessTokenSecret,
            { expiresIn: authConfig.jwt.accessTokenExpiry }
        );

        // Tạo refresh token
        const refreshToken = jwt.sign(
            refreshTokenPayload,
            authConfig.jwt.refreshTokenSecret,
            { expiresIn: authConfig.jwt.refreshTokenExpiry }
        );

        // Tính thởi gian hết hạn cho refresh token
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 ngày

        // Lưu refresh token vào database
        await authRepository.createRefreshToken({
            jtid,
            token: refreshToken,
            userId: user.id,
            expiresAt
        });

        logger.info(`[AuthService] [generateTokenPair] Thành công | UserID: ${user.id} | JTID: ${jtid}`);
        return { accessToken, refreshToken, jtid };
    }

    /**
     * Refresh token với cơ chế Token Rotation
     * @param {string} refreshToken - Refresh token từ client
     * @returns {Object} - { user, accessToken, refreshToken }
     */
    async refreshToken(refreshToken) {
        logger.info(`[AuthService] [refreshToken] Bắt đầu`);

        if (!refreshToken) {
            logger.warn(`[AuthService] [refreshToken] Không có refresh token`);
            throw new AppException({
                message: 'Refresh token không được để trống',
                statusCode: 401,
                errorCode: 'E20003'
            });
        }

        // Verify refresh token
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, authConfig.jwt.refreshTokenSecret);
        } catch (error) {
            logger.warn(`[AuthService] [refreshToken] Token không hợp lệ hoặc đã hết hạn`);
            throw new AppException({
                message: 'Refresh token không hợp lệ hoặc đã hết hạn',
                statusCode: 401,
                errorCode: 'E20004'
            });
        }

        // Kiểm tra loại token
        if (decoded.type !== 'refresh') {
            logger.warn(`[AuthService] [refreshToken] Token không phải refresh token`);
            throw new AppException({
                message: 'Token không hợp lệ',
                statusCode: 401,
                errorCode: 'E20005'
            });
        }

        // Tìm refresh token trong database
        const storedToken = await authRepository.findRefreshTokenByJtid(decoded.jtid);
        if (!storedToken) {
            logger.warn(`[AuthService] [refreshToken] Token không tồn tại trong DB - Có thể bị reuse`);
            throw new AppException({
                message: 'Refresh token không hợp lệ',
                statusCode: 401,
                errorCode: 'E20006'
            });
        }

        // Kiểm tra token có khớp không
        if (storedToken.token !== refreshToken) {
            logger.warn(`[AuthService] [refreshToken] Token không khớp - Có thể bị reuse`);
            throw new AppException({
                message: 'Refresh token không hợp lệ',
                statusCode: 401,
                errorCode: 'E20006'
            });
        }

        // Kiểm tra thởi gian hết hạn
        if (new Date() > new Date(storedToken.expires_at)) {
            logger.warn(`[AuthService] [refreshToken] Token đã hết hạn trong DB`);
            await authRepository.deleteRefreshTokenByJtid(decoded.jtid);
            throw new AppException({
                message: 'Refresh token đã hết hạn',
                statusCode: 401,
                errorCode: 'E20007'
            });
        }

        // Tìm user
        const user = await authRepository.findUserById(decoded.userId);
        if (!user) {
            logger.warn(`[AuthService] [refreshToken] Không tìm thấy user | UserID: ${decoded.userId}`);
            throw new AppException({
                message: 'Ngưởi dùng không tồn tại',
                statusCode: 401,
                errorCode: 'E20008'
            });
        }

        if (!user.is_active) {
            logger.warn(`[AuthService] [refreshToken] Tài khoản bị vô hiệu hóa | UserID: ${user.id}`);
            throw new AppException({
                message: 'Tài khoản đã bị vô hiệu hóa',
                statusCode: 403,
                errorCode: 'E20002'
            });
        }

        // Token Rotation: Xóa token cũ và tạo token mới
        logger.info(`[AuthService] [refreshToken] Thực hiện Token Rotation | UserID: ${user.id}`);
        await authRepository.deleteRefreshTokenByJtid(decoded.jtid);

        // Tạo cặp token mới
        const tokens = await this.generateTokenPair(user);

        logger.info(`[AuthService] [refreshToken] Thành công | UserID: ${user.id}`);
        return {
            user,
            ...tokens
        };
    }

    /**
     * Đăng xuất
     * @param {string} refreshToken - Refresh token cần thu hồi
     */
    async logout(refreshToken) {
        logger.info(`[AuthService] [logout] Bắt đầu`);

        if (!refreshToken) {
            logger.warn(`[AuthService] [logout] Không có refresh token`);
            return { success: true, message: 'Đã đăng xuất' };
        }

        try {
            // Decode token để lấy jtid
            const decoded = jwt.verify(refreshToken, authConfig.jwt.refreshTokenSecret);

            // Xóa refresh token khỏi database
            if (decoded.jtid) {
                await authRepository.deleteRefreshTokenByJtid(decoded.jtid);
                logger.info(`[AuthService] [logout] Đã xóa refresh token | JTID: ${decoded.jtid}`);
            }
        } catch (error) {
            logger.warn(`[AuthService] [logout] Token không hợp lệ, bỏ qua`);
        }

        logger.info(`[AuthService] [logout] Thành công`);
        return { success: true, message: 'Đăng xuất thành công' };
    }

    /**
     * Đăng xuất khởi tất cả thiết bị
     * @param {number} userId - ID của user
     */
    async logoutAll(userId) {
        logger.info(`[AuthService] [logoutAll] Bắt đầu | UserID: ${userId}`);

        // Xóa tất cả refresh tokens của user
        const deletedCount = await authRepository.deleteAllRefreshTokensByUserId(userId);

        logger.info(`[AuthService] [logoutAll] Thành công | Deleted: ${deletedCount} tokens`);
        return {
            success: true,
            message: 'Đã đăng xuất khởi tất cả thiết bị',
            deletedTokens: deletedCount
        };
    }

    /**
     * Lấy thông tin user hiện tại
     * @param {number} userId - ID của user
     */
    async getCurrentUser(userId) {
        logger.info(`[AuthService] [getCurrentUser] Bắt đầu | UserID: ${userId}`);

        const user = await authRepository.findUserById(userId);
        if (!user) {
            logger.warn(`[AuthService] [getCurrentUser] Không tìm thấy user | UserID: ${userId}`);
            throw new AppException({
                message: 'Không tìm thấy ngưởi dùng',
                statusCode: 404,
                errorCode: 'E20009'
            });
        }

        logger.info(`[AuthService] [getCurrentUser] Thành công | UserID: ${userId}`);
        return user;
    }

    /**
     * Hash mật khẩu
     * @param {string} password - Mật khẩu cần hash
     * @returns {string} - Mật khẩu đã hash
     */
    async hashPassword(password) {
        return bcrypt.hash(password, authConfig.bcrypt.saltRounds);
    }

    /**
     * So sánh mật khẩu
     * @param {string} password - Mật khẩu ngưởi dùng nhập
     * @param {string} hash - Mật khẩu đã hash trong DB
     * @returns {boolean} - Kết quả so sánh
     */
    async comparePassword(password, hash) {
        return bcrypt.compare(password, hash);
    }
}

module.exports = new AuthService();
