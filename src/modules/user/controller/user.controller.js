const userService = require('../service/user.service');
const logger = require('../../../utils/logger');

/**
 * Controller xử lý HTTP requests cho User
 * Chỉ đơn giản là gọi Service và trả về response,
 * mọi validation và error handling đều ở Service
 */
class UserController {
    /**
     * GET /api/users
     * Lấy danh sách users
     */
    async getAll(req, res, next) {
        try {
            logger.info(`[UserController] [getAll] Bắt đầu | Query: ${JSON.stringify(req.query)}`);

            const result = await userService.getAll(req.query);

            logger.info(`[UserController] [getAll] Thành công | Tổng: ${result.pagination.totalCount}`);
            return res.status(200).json({
                success: true,
                data: result.data,
                pagination: result.pagination
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * GET /api/users/:id
     * Lấy chi tiết user theo ID
     */
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            logger.info(`[UserController] [getById] Bắt đầu | ID: ${id}`);

            const user = await userService.getById(id);

            logger.info(`[UserController] [getById] Thành công | ID: ${id}`);
            return res.status(200).json({
                success: true,
                data: user
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * POST /api/users
     * Tạo mới user
     */
    async create(req, res, next) {
        try {
            logger.info(`[UserController] [create] Bắt đầu | Data: ${JSON.stringify(req.body)}`);

            const user = await userService.create(req.body);

            logger.info(`[UserController] [create] Thành công | ID: ${user.id}`);
            return res.status(201).json({
                success: true,
                message: 'Tạo user thành công',
                data: user
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * PUT /api/users/:id
     * Cập nhật user
     */
    async update(req, res, next) {
        try {
            const { id } = req.params;
            logger.info(`[UserController] [update] Bắt đầu | ID: ${id}`);

            const user = await userService.update(id, req.body);

            logger.info(`[UserController] [update] Thành công | ID: ${id}`);
            return res.status(200).json({
                success: true,
                message: 'Cập nhật user thành công',
                data: user
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * DELETE /api/users/:id
     * Xóa mềm user
     */
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            logger.info(`[UserController] [delete] Bắt đầu | ID: ${id}`);

            await userService.softDelete(id);

            logger.info(`[UserController] [delete] Thành công | ID: ${id}`);
            return res.status(200).json({
                success: true,
                message: 'Xóa user thành công'
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * DELETE /api/users/:id/hard
     * Xóa cứng user (chỉ admin)
     */
    async hardDelete(req, res, next) {
        try {
            const { id } = req.params;
            logger.info(`[UserController] [hardDelete] Bắt đầu | ID: ${id}`);

            await userService.hardDelete(id);

            logger.info(`[UserController] [hardDelete] Thành công | ID: ${id}`);
            return res.status(200).json({
                success: true,
                message: 'Xóa user vĩnh viễn thành công'
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * POST /api/users/with-ref
     * Tạo user với ref_id và ref_type bắt buộc
     */
    async createWithRef(req, res, next) {
        try {
            logger.info(`[UserController] [createWithRef] Bắt đầu | Data: ${JSON.stringify(req.body)}`);

            const user = await userService.createWithRef(req.body);

            logger.info(`[UserController] [createWithRef] Thành công | ID: ${user.id}`);
            return res.status(201).json({
                success: true,
                message: 'Tạo user với tham chiếu thành công',
                data: user
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new UserController();
