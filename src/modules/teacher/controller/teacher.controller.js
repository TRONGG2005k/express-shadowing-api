const teacherService = require('../service/teacher.service');
const logger = require('../../../utils/logger');

/**
 * Controller xử lý HTTP requests cho Teacher
 * Chỉ đơn giản là gọi Service và trả về response,
 * mọi validation và error handling đều ở Service
 */
class TeacherController {
    /**
     * GET /api/teachers
     * Lấy danh sách giáo viên
     */
    async getAll(req, res, next) {
        try {
            logger.info(`[TeacherController] [getAll] Bắt đầu | Query: ${JSON.stringify(req.query)}`);

            const result = await teacherService.getAllTeachers(req.query);

            logger.info(`[TeacherController] [getAll] Thành công | Tổng: ${result.pagination.totalCount}`);
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
     * GET /api/teachers/:id
     * Lấy chi tiết giáo viên
     */
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            logger.info(`[TeacherController] [getById] Bắt đầu | ID: ${id}`);

            const teacher = await teacherService.getTeacherById(id);

            logger.info(`[TeacherController] [getById] Thành công | ID: ${id}`);
            return res.status(200).json({
                success: true,
                data: teacher
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * POST /api/teachers
     * Tạo mới giáo viên
     */
    async create(req, res, next) {
        try {
            logger.info(`[TeacherController] [create] Bắt đầu | Data: ${JSON.stringify(req.body)}`);

            const teacher = await teacherService.createTeacher(req.body);

            logger.info(`[TeacherController] [create] Thành công | ID: ${teacher.id}`);
            return res.status(201).json({
                success: true,
                message: 'Tạo giáo viên thành công',
                data: teacher
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * PUT /api/teachers/:id
     * Cập nhật giáo viên
     */
    async update(req, res, next) {
        try {
            const { id } = req.params;
            logger.info(`[TeacherController] [update] Bắt đầu | ID: ${id}`);

            const teacher = await teacherService.updateTeacher(id, req.body);

            logger.info(`[TeacherController] [update] Thành công | ID: ${id}`);
            return res.status(200).json({
                success: true,
                message: 'Cập nhật giáo viên thành công',
                data: teacher
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * DELETE /api/teachers/:id
     * Xóa mềm giáo viên
     */
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            logger.info(`[TeacherController] [delete] Bắt đầu | ID: ${id}`);

            await teacherService.softDeleteTeacher(id);

            logger.info(`[TeacherController] [delete] Thành công | ID: ${id}`);
            return res.status(200).json({
                success: true,
                message: 'Xóa giáo viên thành công'
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * DELETE /api/teachers/:id/hard
     * Xóa cứng giáo viên (chỉ admin)
     */
    async hardDelete(req, res, next) {
        try {
            const { id } = req.params;
            logger.info(`[TeacherController] [hardDelete] Bắt đầu | ID: ${id}`);

            await teacherService.hardDeleteTeacher(id);

            logger.info(`[TeacherController] [hardDelete] Thành công | ID: ${id}`);
            return res.status(200).json({
                success: true,
                message: 'Xóa giáo viên vĩnh viễn thành công'
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * GET /api/teachers/:id/classes
     * Lấy danh sách lớp học của giáo viên
     */
    async getClasses(req, res, next) {
        try {
            const { id } = req.params;
            logger.info(`[TeacherController] [getClasses] Bắt đầu | ID: ${id}`);

            const classes = await teacherService.getTeacherClasses(id);

            logger.info(`[TeacherController] [getClasses] Thành công | ID: ${id} | Classes: ${classes.length}`);
            return res.status(200).json({
                success: true,
                data: classes
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new TeacherController();
