const UserService = require('../service/user.service');
const logger = require('../../../utils/logger');

/**
 * Controller xử lý HTTP requests cho User
 * Chỉ đơn giản là gọi Service và trả về response,
 * mọi validation và error handling đều ở Service
 */
const UserController = {
    /**
     * Lấy danh sách tất cả users
     * GET /api/users
     */
    async getAll(req, res, next) {
        try {
            logger.info(`[UserController] [getAll] Bắt đầu | Query: ${JSON.stringify(req.query)}`);

            const users = await UserService.getAll();

            logger.info(`[UserController] [getAll] Thành công | Số lượng: ${users.length}`);
            return res.status(200).json({
                success: true,
                data: users
            });
        } catch (err) {
            next(err);
        }
    },

    /**
     * Lấy chi tiết user theo ID
     * GET /api/users/:id
     */
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            logger.info(`[UserController] [getById] Bắt đầu | ID: ${id}`);

            const user = await UserService.getById(id);

            logger.info(`[UserController] [getById] Thành công | ID: ${id}`);
            return res.status(200).json({
                success: true,
                data: user
            });
        } catch (err) {
            next(err);
        }
    },

    /**
     * Tạo mới user
     * POST /api/users
     */
    async create(req, res, next) {
        try {
            logger.info(`[UserController] [create] Bắt đầu | Data: ${JSON.stringify(req.body)}`);

            const user = await UserService.create(req.body);

            logger.info(`[UserController] [create] Thành công | ID: ${user.id}`);
            return res.status(201).json({
                success: true,
                message: 'Tạo user thành công',
                data: user
            });
        } catch (err) {
            next(err);
        }
    },

    /**
     * Cập nhật user
     * PUT /api/users/:id
     */
    async update(req, res, next) {
        try {
            const { id } = req.params;
            logger.info(`[UserController] [update] Bắt đầu | ID: ${id}`);

            const user = await UserService.update(id, req.body);

            logger.info(`[UserController] [update] Thành công | ID: ${id}`);
            return res.status(200).json({
                success: true,
                message: 'Cập nhật user thành công',
                data: user
            });
        } catch (err) {
            next(err);
        }
    },

    /**
     * Xóa user
     * DELETE /api/users/:id
     */
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            logger.info(`[UserController] [delete] Bắt đầu | ID: ${id}`);

            await UserService.delete(id);

            logger.info(`[UserController] [delete] Thành công | ID: ${id}`);
            return res.status(200).json({
                success: true,
                message: 'Xóa user thành công'
            });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = UserController;
