const teacherRepository = require('../repository/teacher.repository');
const { CreateTeacherDto, UpdateTeacherDto, TeacherQueryDto, TeacherIdParamDto } = require('../dto/create-teacher.dto');
const AppException = require('../../../error/exception/AppException');
const errorMessages = require('../../../error/error.message');
const logger = require('../../../utils/logger');

/**
 * Service xử lý business logic cho Teacher
 * Tất cả validation và error handling đều ở đây
 */
class TeacherService {
    /**
     * Lấy danh sách giáo viên
     */
    async getAllTeachers(query) {
        logger.info(`[TeacherService] [getAllTeachers] Bắt đầu | Query: ${JSON.stringify(query)}`);

        // Validate query params
        const validatedQuery = TeacherQueryDto.parse(query);

        // Lấy tất cả
        const result = await teacherRepository.findAll({
            page: validatedQuery.page,
            limit: validatedQuery.limit,
            search: validatedQuery.search,
            sortBy: validatedQuery.sortBy,
            order: validatedQuery.order
        });

        logger.info(`[TeacherService] [getAllTeachers] Hoàn thành | Tổng: ${result.pagination.totalCount}`);
        return result;
    }

    /**
     * Lấy giáo viên theo ID
     */
    async getTeacherById(id) {
        logger.info(`[TeacherService] [getTeacherById] Bắt đầu | ID: ${id}`);

        // Validate ID
        TeacherIdParamDto.parse({ id });

        const teacher = await teacherRepository.findById(id);

        if (!teacher) {
            logger.warn(`[TeacherService] [getTeacherById] Không tìm thấy | ID: ${id}`);
            throw new AppException({
                ...errorMessages.NOT_FOUND,
                message: 'Không tìm thấy giáo viên'
            });
        }

        logger.info(`[TeacherService] [getTeacherById] Tìm thấy | ID: ${id}`);
        return teacher;
    }

    /**
     * Tạo mới giáo viên
     */
    async createTeacher(data) {
        logger.info(`[TeacherService] [createTeacher] Bắt đầu | Name: ${data?.full_name}`);

        // Validate data
        const validatedData = CreateTeacherDto.parse(data);

        // Kiểm tra giáo viên đã tồn tại chưa
        const exists = await teacherRepository.existsByName(validatedData.full_name);
        if (exists) {
            logger.warn(`[TeacherService] [createTeacher] Đã tồn tại | Name: ${validatedData.full_name}`);
            throw new AppException({
                message: `Giáo viên "${validatedData.full_name}" đã tồn tại`,
                statusCode: 409,
                errorCode: 'E10010'
            });
        }

        const created = await teacherRepository.create(validatedData);

        logger.info(`[TeacherService] [createTeacher] Thành công | ID: ${created.id}`);
        return created;
    }

    /**
     * Cập nhật giáo viên
     */
    async updateTeacher(id, data) {
        logger.info(`[TeacherService] [updateTeacher] Bắt đầu | ID: ${id}`);

        // Validate ID
        TeacherIdParamDto.parse({ id });

        // Validate data
        const validatedData = UpdateTeacherDto.parse(data);

        // Kiểm tra giáo viên có tồn tại không
        const existing = await teacherRepository.findById(id);
        if (!existing) {
            logger.warn(`[TeacherService] [updateTeacher] Không tìm thấy | ID: ${id}`);
            throw new AppException({
                ...errorMessages.NOT_FOUND,
                message: 'Không tìm thấy giáo viên'
            });
        }

        // Nếu cập nhật tên, kiểm tra trùng lặp
        if (validatedData.full_name && validatedData.full_name !== existing.full_name) {
            const exists = await teacherRepository.existsByName(validatedData.full_name);
            if (exists) {
                logger.warn(`[TeacherService] [updateTeacher] Đã tồn tại | Name: ${validatedData.full_name}`);
                throw new AppException({
                    message: `Giáo viên "${validatedData.full_name}" đã tồn tại`,
                    statusCode: 409,
                    errorCode: 'E10011'
                });
            }
        }

        const updated = await teacherRepository.update(id, validatedData);

        logger.info(`[TeacherService] [updateTeacher] Thành công | ID: ${id}`);
        return updated;
    }

    /**
     * Xóa mềm giáo viên
     */
    async softDeleteTeacher(id) {
        logger.info(`[TeacherService] [softDeleteTeacher] Bắt đầu | ID: ${id}`);

        // Validate ID
        TeacherIdParamDto.parse({ id });

        // Kiểm tra giáo viên có tồn tại không
        const existing = await teacherRepository.findById(id);
        if (!existing) {
            logger.warn(`[TeacherService] [softDeleteTeacher] Không tìm thấy | ID: ${id}`);
            throw new AppException({
                ...errorMessages.NOT_FOUND,
                message: 'Không tìm thấy giáo viên'
            });
        }

        await teacherRepository.softDelete(id);

        logger.info(`[TeacherService] [softDeleteTeacher] Thành công | ID: ${id}`);
        return true;
    }

    /**
     * Xóa cứng giáo viên (chỉ dùng cho admin)
     */
    async hardDeleteTeacher(id) {
        logger.info(`[TeacherService] [hardDeleteTeacher] Bắt đầu | ID: ${id}`);

        // Validate ID
        TeacherIdParamDto.parse({ id });

        // Kiểm tra giáo viên có tồn tại không
        const existing = await teacherRepository.findById(id);
        if (!existing) {
            logger.warn(`[TeacherService] [hardDeleteTeacher] Không tìm thấy | ID: ${id}`);
            throw new AppException({
                ...errorMessages.NOT_FOUND,
                message: 'Không tìm thấy giáo viên'
            });
        }

        await teacherRepository.delete(id);

        logger.info(`[TeacherService] [hardDeleteTeacher] Thành công | ID: ${id}`);
        return true;
    }
}

module.exports = new TeacherService();
