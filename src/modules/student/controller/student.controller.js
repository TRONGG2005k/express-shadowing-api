const studentService = require('../service/student.service');
const logger = require('../../../utils/logger');

/**
 * Controller xử lý HTTP requests cho Student
 * Chỉ đơn giản là gọi Service và trả về response,
 * mọi validation và error handling đều ở Service
 */
class StudentController {
    /**
     * GET /api/students
     * Lấy danh sách học sinh
     */
    async getAll(req, res, next) {
        try {
            logger.info(`[StudentController] [getAll] Bắt đầu | Query: ${JSON.stringify(req.query)}`);

            const result = await studentService.getAllStudents(req.query);

            logger.info(`[StudentController] [getAll] Thành công | Tổng: ${result.pagination.totalCount}`);
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
     * GET /api/students/:id
     * Lấy chi tiết học sinh
     */
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            logger.info(`[StudentController] [getById] Bắt đầu | ID: ${id}`);

            const student = await studentService.getStudentById(id);

            logger.info(`[StudentController] [getById] Thành công | ID: ${id}`);
            return res.status(200).json({
                success: true,
                data: student
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * POST /api/students
     * Tạo mới học sinh
     */
    async create(req, res, next) {
        try {
            logger.info(`[StudentController] [create] Bắt đầu | Data: ${JSON.stringify(req.body)}`);

            const student = await studentService.createStudent(req.body);

            logger.info(`[StudentController] [create] Thành công | ID: ${student.id}`);
            return res.status(201).json({
                success: true,
                message: 'Tạo học sinh thành công',
                data: student
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * PUT /api/students/:id
     * Cập nhật học sinh
     */
    async update(req, res, next) {
        try {
            const { id } = req.params;
            logger.info(`[StudentController] [update] Bắt đầu | ID: ${id}`);

            const student = await studentService.updateStudent(id, req.body);

            logger.info(`[StudentController] [update] Thành công | ID: ${id}`);
            return res.status(200).json({
                success: true,
                message: 'Cập nhật học sinh thành công',
                data: student
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * DELETE /api/students/:id
     * Xóa mềm học sinh
     */
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            logger.info(`[StudentController] [delete] Bắt đầu | ID: ${id}`);

            await studentService.softDeleteStudent(id);

            logger.info(`[StudentController] [delete] Thành công | ID: ${id}`);
            return res.status(200).json({
                success: true,
                message: 'Xóa học sinh thành công'
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * DELETE /api/students/:id/hard
     * Xóa cứng học sinh (chỉ admin)
     */
    async hardDelete(req, res, next) {
        try {
            const { id } = req.params;
            logger.info(`[StudentController] [hardDelete] Bắt đầu | ID: ${id}`);

            await studentService.hardDeleteStudent(id);

            logger.info(`[StudentController] [hardDelete] Thành công | ID: ${id}`);
            return res.status(200).json({
                success: true,
                message: 'Xóa học sinh vĩnh viễn thành công'
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * POST /api/students/:id/classes
     * Thêm học sinh vào lớp học
     */
    async addToClass(req, res, next) {
        try {
            const { id } = req.params;
            const { class_id } = req.body;
            logger.info(`[StudentController] [addToClass] Bắt đầu | Student: ${id}, Class: ${class_id}`);

            const result = await studentService.addStudentToClass(id, class_id);

            logger.info(`[StudentController] [addToClass] Thành công`);
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
     * DELETE /api/students/:id/classes/:classId
     * Xóa học sinh khỏi lớp học
     */
    async removeFromClass(req, res, next) {
        try {
            const { id, classId } = req.params;
            logger.info(`[StudentController] [removeFromClass] Bắt đầu | Student: ${id}, Class: ${classId}`);

            await studentService.removeStudentFromClass(id, classId);

            logger.info(`[StudentController] [removeFromClass] Thành công`);
            return res.status(200).json({
                success: true,
                message: 'Xóa học sinh khỏi lớp thành công'
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new StudentController();
