const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth.config');
const AppException = require('../error/exception/AppException');
const logger = require('../utils/logger');

/**
 * Middleware xác thực JWT
 */
class AuthMiddleware {
    /**
     * Xác thực access token
     */
    authenticate(req, res, next) {
        try {
            logger.info(`[AuthMiddleware] [authenticate] Bắt đầu xác thực | Path: ${req.path}`);

            // Lấy token từ header
            const authHeader = req.headers.authorization;
            
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                logger.warn(`[AuthMiddleware] [authenticate] Không tìm thấy token`);
                throw new AppException({
                    message: 'Không tìm thấy access token',
                    statusCode: 401,
                    errorCode: 'E30001'
                });
            }

            const token = authHeader.substring(7); // Bỏ 'Bearer '

            // Verify token
            let decoded;
            try {
                decoded = jwt.verify(token, authConfig.jwt.accessTokenSecret);
            } catch (error) {
                logger.warn(`[AuthMiddleware] [authenticate] Token không hợp lệ: ${error.message}`);
                
                if (error.name === 'TokenExpiredError') {
                    throw new AppException({
                        message: 'Access token đã hết hạn',
                        statusCode: 401,
                        errorCode: 'E30002'
                    });
                }
                
                throw new AppException({
                    message: 'Access token không hợp lệ',
                    statusCode: 401,
                    errorCode: 'E30003'
                });
            }

            // Kiểm tra loại token
            if (decoded.type !== 'access') {
                logger.warn(`[AuthMiddleware] [authenticate] Token không phải access token`);
                throw new AppException({
                    message: 'Token không hợp lệ',
                    statusCode: 401,
                    errorCode: 'E30004'
                });
            }

            // Lưu thông tin user vào request
            req.user = {
                userId: decoded.userId,
                username: decoded.username,
                role: decoded.role
            };

            logger.info(`[AuthMiddleware] [authenticate] Xác thực thành công | UserID: ${decoded.userId}`);
            next();
        } catch (err) {
            next(err);
        }
    }

    /**
     * Kiểm tra quyền admin
     */
    requireAdmin(req, res, next) {
        try {
            logger.info(`[AuthMiddleware] [requireAdmin] Kiểm tra quyền admin | UserID: ${req.user?.userId}`);

            if (!req.user || req.user.role !== 'admin') {
                logger.warn(`[AuthMiddleware] [requireAdmin] Không có quyền admin | Role: ${req.user?.role}`);
                throw new AppException({
                    message: 'Không có quyền truy cập. Yêu cầu quyền admin.',
                    statusCode: 403,
                    errorCode: 'E30005'
                });
            }

            logger.info(`[AuthMiddleware] [requireAdmin] Có quyền admin | UserID: ${req.user.userId}`);
            next();
        } catch (err) {
            next(err);
        }
    }

    /**
     * Kiểm tra quyền teacher
     */
    requireTeacher(req, res, next) {
        try {
            logger.info(`[AuthMiddleware] [requireTeacher] Kiểm tra quyền teacher | UserID: ${req.user?.userId}`);

            if (!req.user || (req.user.role !== 'teacher' && req.user.role !== 'admin')) {
                logger.warn(`[AuthMiddleware] [requireTeacher] Không có quyền teacher | Role: ${req.user?.role}`);
                throw new AppException({
                    message: 'Không có quyền truy cập. Yêu cầu quyền teacher hoặc admin.',
                    statusCode: 403,
                    errorCode: 'E30006'
                });
            }

            logger.info(`[AuthMiddleware] [requireTeacher] Có quyền | UserID: ${req.user.userId}`);
            next();
        } catch (err) {
            next(err);
        }
    }

    /**
     * Kiểm tra quyền student
     */
    requireStudent(req, res, next) {
        try {
            logger.info(`[AuthMiddleware] [requireStudent] Kiểm tra quyền student | UserID: ${req.user?.userId}`);

            if (!req.user || (req.user.role !== 'student' && req.user.role !== 'admin')) {
                logger.warn(`[AuthMiddleware] [requireStudent] Không có quyền student | Role: ${req.user?.role}`);
                throw new AppException({
                    message: 'Không có quyền truy cập. Yêu cầu quyền student hoặc admin.',
                    statusCode: 403,
                    errorCode: 'E30007'
                });
            }

            logger.info(`[AuthMiddleware] [requireStudent] Có quyền | UserID: ${req.user.userId}`);
            next();
        } catch (err) {
            next(err);
        }
    }

    /**
     * Optional authentication - không bắt buộc đăng nhập
     * Nếu có token hợp lệ sẽ gán req.user, nếu không thì vẫn cho đi tiếp
     */
    optionalAuth(req, res, next) {
        try {
            logger.info(`[AuthMiddleware] [optionalAuth] Bắt đầu | Path: ${req.path}`);

            const authHeader = req.headers.authorization;
            
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                logger.info(`[AuthMiddleware] [optionalAuth] Không có token, tiếp tục`);
                return next();
            }

            const token = authHeader.substring(7);

            try {
                const decoded = jwt.verify(token, authConfig.jwt.accessTokenSecret);
                
                if (decoded.type === 'access') {
                    req.user = {
                        userId: decoded.userId,
                        username: decoded.username,
                        role: decoded.role
                    };
                    logger.info(`[AuthMiddleware] [optionalAuth] Xác thực thành công | UserID: ${decoded.userId}`);
                }
            } catch (error) {
                logger.info(`[AuthMiddleware] [optionalAuth] Token không hợp lệ, bỏ qua`);
            }

            next();
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new AuthMiddleware();
