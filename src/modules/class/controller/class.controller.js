const classService = require('../service/class.service');
const logger = require('../../../utils/logger');

/**
 * Controller xử lý HTTP requests cho Class
 * Chỉ đơn giản là gọi Service và trả về response,
 * mọi validation và error handling đều ở Service
 */
class ClassController {
    /**
     * GET /api/classes
     * Lấy danh sách lớp học
     */
    async getAll(req, res, next) {
        try {
            logger.info(`[ClassController] [getAll] Bắt đầu | Query: ${JSON.stringify(req.query)}`);

            const result = await classService.getAllClasses(req.query);

            logger.info(`[ClassController] [getAll] Thành công | Tổng: ${result.pagination.totalCount}`);
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
     * GET /api/classes/:id
     * Lấy chi tiết lớp học
     */
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            logger.info(`[ClassController] [getById] Bắt đầu | ID: ${id}`);

            const classData = await classService.getClassById(id);

            logger.info(`[ClassController] [getById] Thành công | ID: ${id}`);
            return res.status(200).json({
                success: true,
                data: classData
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * POST /api/classes
     * Tạo mới lớp học
     */
    async create(req, res, next) {
        try {
            logger.info(`[ClassController] [create] Bắt đầu | Data: ${JSON.stringify(req.body)}`);

            const classData = await classService.createClass(req.body);

            logger.info(`[ClassController] [create] Thành công | ID: ${classData.id}`);
            return res.status(201).json({
                success: true,
                message: 'Tạo lớp học thành công',
                data: classData
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * PUT /api/classes/:id
     * Cập nhật lớp học
     */
    async update(req, res, next) {
        try {
            const { id } = req.params;
            logger.info(`[ClassController] [update] Bắt đầu | ID: ${id}`);

            const classData = await classService.updateClass(id, req.body);

            logger.info(`[ClassController] [update] Thành công | ID: ${id}`);
            return res.status(200).json({
                success: true,
                message: 'Cập nhật lớp học thành công',
                data: classData
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * DELETE /api/classes/:id
     * Xóa mềm lớp học
     */
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            logger.info(`[ClassController] [delete] Bắt đầu | ID: ${id}`);

            await classService.softDeleteClass(id);

            logger.info(`[ClassController] [delete] Thành công | ID: ${id}`);
            return res.status(200).json({
                success: true,
                message: 'Xóa lớp học thành công'
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * DELETE /api/classes/:id/hard
     * Xóa cứng lớp học (chỉ admin)
     */
    async hardDelete(req, res, next) {
        try {
            const { id } = req.params;
            logger.info(`[ClassController] [hardDelete] Bắt đầu | ID: ${id}`);

            await classService.hardDeleteClass(id);

            logger.info(`[ClassController] [hardDelete] Thành công | ID: ${id}`);
            return res.status(200).json({
                success: true,
                message: 'Xóa lớp học vĩnh viễn thành công'
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * GET /api/classes/:id/students
     * Lấy danh sách học sinh trong lớp
     */
    async getStudents(req, res, next) {
        try {
            const { id } = req.params;
            logger.info(`[ClassController] [getStudents] Bắt đầu | ID: ${id}`);

            const result = await classService.getClassStudents(id, req.query);

            logger.info(`[ClassController] [getStudents] Thành công | ID: ${id} | Students: ${result.pagination.totalCount}`);
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
     * POST /api/classes/:id/students
     * Thêm học sinh vào lớp
     */
    async addStudent(req, res, next) {
        try {
            const { id } = req.params;
            const { student_id } = req.body;
            logger.info(`[ClassController] [addStudent] Bắt đầu | Class: ${id}, Student: ${student_id}`);

            const result = await classService.addStudentToClass(id, student_id);

            logger.info(`[ClassController] [addStudent] Thành công`);
            return res.status(200).json({
                success: true,
                message: 'Thêm học sinh vào lớp thành công',
                data: result
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * DELETE /api/classes/:id/students/:studentId
     * Xóa học sinh khỏi lớp
     */
    async removeStudent(req, res, next) {
        try {
            const { id, studentId } = req.params;
            logger.info(`[ClassController] [removeStudent] Bắt đầu | Class: ${id}, Student: ${studentId}`);

            await classService.removeStudentFromClass(id, studentId);

            logger.info(`[ClassController] [removeStudent] Thành công`);
            return res.status(200).json({
                success: true,
                message: 'Xóa học sinh khỏi lớp thành công'
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new ClassController();