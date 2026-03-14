const authService = require('../service/auth.service');
const authConfig = require('../../../config/auth.config');
const logger = require('../../../utils/logger');

/**
 * Controller xử lý HTTP requests cho Authentication
 */
class AuthController {
    /**
     * POST /api/auth/register
     * Đăng ký
     */
    async register(req, res, next) {
        try {
            logger.info(`[AuthController] [register] Bắt đầu | Phone: ${req.body?.phone}`);

            const result = await authService.register(req.body);

            // Set refresh token vào cookie
            res.cookie('refreshToken', result.refreshToken, {
                ...authConfig.cookie,
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            logger.info(`[AuthController] [register] Thành công | UserID: ${result.user.id}`);
            return res.status(201).json({
                success: true,
                message: 'Đăng ký thành công',
                data: {
                    user: result.user,
                    accessToken: result.accessToken
                }
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * POST /api/auth/login
     * Đăng nhập
     */
    async login(req, res, next) {
        try {
            logger.info(`[AuthController] [login] Bắt đầu | Phone: ${req.body?.phone}`);

            const result = await authService.login(req.body);

            // Set refresh token vào cookie
            res.cookie('refreshToken', result.refreshToken, {
                ...authConfig.cookie,
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            logger.info(`[AuthController] [login] Thành công | UserID: ${result.user.id}`);
            return res.status(200).json({
                success: true,
                message: 'Đăng nhập thành công',
                data: {
                    user: result.user,
                    accessToken: result.accessToken
                }
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * GET /api/auth/refresh
     * Refresh token - Không cần body, lấy refresh token từ cookie
     */
    async refresh(req, res, next) {
        try {
            logger.info(`[AuthController] [refresh] Bắt đầu`);

            // Lấy refresh token từ cookie (không cần body)
            const refreshToken = req.cookies?.refreshToken;

            const result = await authService.refreshToken(refreshToken);

            // Set refresh token mới vào cookie
            res.cookie('refreshToken', result.refreshToken, {
                ...authConfig.cookie,
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            logger.info(`[AuthController] [refresh] Thành công | UserID: ${result.user.id}`);
            return res.status(200).json({
                success: true,
                message: 'Refresh token thành công',
                data: {
                    user: result.user,
                    accessToken: result.accessToken
                }
            });
        } catch (err) {
            // Xóa cookie nếu refresh thất bại
            res.clearCookie('refreshToken');
            next(err);
        }
    }

    /**
     * POST /api/auth/logout
     * Đăng xuất
     */
    async logout(req, res, next) {
        try {
            logger.info(`[AuthController] [logout] Bắt đầu`);

            // Lấy refresh token từ cookie hoặc body
            const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

            const result = await authService.logout(refreshToken);

            // Xóa cookie
            res.clearCookie('refreshToken');

            logger.info(`[AuthController] [logout] Thành công`);
            return res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (err) {
            // Vẫn xóa cookie ngay cả khi có lỗi
            res.clearCookie('refreshToken');
            next(err);
        }
    }

    /**
     * POST /api/auth/logout-all
     * Đăng xuất khởi tất cả thiết bị
     */
    async logoutAll(req, res, next) {
        try {
            const userId = req.user?.userId;
            logger.info(`[AuthController] [logoutAll] Bắt đầu | UserID: ${userId}`);

            const result = await authService.logoutAll(userId);

            // Xóa cookie
            res.clearCookie('refreshToken');

            logger.info(`[AuthController] [logoutAll] Thành công | UserID: ${userId}`);
            return res.status(200).json({
                success: true,
                message: result.message,
                deletedTokens: result.deletedTokens
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * GET /api/auth/me
     * Lấy thông tin user hiện tại
     */
    async getCurrentUser(req, res, next) {
        try {
            const userId = req.user?.userId;
            logger.info(`[AuthController] [getCurrentUser] Bắt đầu | UserID: ${userId}`);

            const user = await authService.getCurrentUser(userId);

            logger.info(`[AuthController] [getCurrentUser] Thành công | UserID: ${userId}`);
            return res.status(200).json({
                success: true,
                data: user
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new AuthController();
