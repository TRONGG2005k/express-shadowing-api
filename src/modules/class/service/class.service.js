const { z } = require('zod');
const { prisma } = require('../../../config/prisma');
const classRepository = require('../repository/class.repository');
const { CreateClassDto, UpdateClassDto, ClassQueryDto, ClassIdParamDto } = require('../dto/create-class.dto');
const AppException = require('../../../error/exception/AppException');
const errorMessages = require('../../../error/error.message');
const logger = require('../../../utils/logger');

/**
 * Service xử lý business logic cho Class
 * Tất cả validation và error handling đều ở đây
 */
class ClassService {
    /**
     * Lấy danh sách lớp học
     */
    async getAllClasses(query) {
        logger.info(`[ClassService] [getAllClasses] Bắt đầu | Query: ${JSON.stringify(query)}`);

        // Validate query params
        const validatedQuery = ClassQueryDto.parse(query);

        // Lấy tất cả
        const result = await classRepository.findAll({
            page: validatedQuery.page,
            limit: validatedQuery.limit,
            search: validatedQuery.search,
            teacher_id: validatedQuery.teacher_id,
            sortBy: validatedQuery.sortBy,
            order: validatedQuery.order
        });

        logger.info(`[ClassService] [getAllClasses] Hoàn thành | Tổng: ${result.pagination.totalCount}`);
        return result;
    }

    /**
     * Lấy lớp học theo ID
     */
    async getClassById(id) {
        logger.info(`[ClassService] [getClassById] Bắt đầu | ID: ${id}`);

        // Validate ID
        ClassIdParamDto.parse({ id });

        const classData = await classRepository.findById(id);

        if (!classData) {
            logger.warn(`[ClassService] [getClassById] Không tìm thấy | ID: ${id}`);
            throw new AppException({
                ...errorMessages.NOT_FOUND,
                message: 'Không tìm thấy lớp học'
            });
        }

        logger.info(`[ClassService] [getClassById] Tìm thấy | ID: ${id}`);
        return classData;
    }

    /**
     * Tạo mới lớp học
     */
    async createClass(data) {
        logger.info(`[ClassService] [createClass] Bắt đầu | Name: ${data?.name}`);

        // Validate data
        const validatedData = CreateClassDto.parse(data);

        // Kiểm tra tên lớp đã tồn tại chưa
        const exists = await classRepository.existsByName(validatedData.name);
        if (exists) {
            logger.warn(`[ClassService] [createClass] Đã tồn tại | Name: ${validatedData.name}`);
            throw new AppException({
                message: `Lớp học "${validatedData.name}" đã tồn tại`,
                statusCode: 409,
                errorCode: 'E10020'
            });
        }

        // Kiểm tra giáo viên có tồn tại không
        const teacherExists = await classRepository.teacherExists(validatedData.teacher_id);
        if (!teacherExists) {
            logger.warn(`[ClassService] [createClass] Giáo viên không tồn tại | TeacherId: ${validatedData.teacher_id}`);
            throw new AppException({
                ...errorMessages.NOT_FOUND,
                message: 'Không tìm thấy giáo viên'
            });
        }

        const created = await classRepository.create(validatedData);

        logger.info(`[ClassService] [createClass] Thành công | ID: ${created.id}`);
        return created;
    }

    /**
     * Cập nhật lớp học
     */
    async updateClass(id, data) {
        logger.info(`[ClassService] [updateClass] Bắt đầu | ID: ${id}`);

        // Validate ID
        ClassIdParamDto.parse({ id });

        // Validate data
        const validatedData = UpdateClassDto.parse(data);

        // Kiểm tra lớp học có tồn tại không
        const existing = await classRepository.findById(id);
        if (!existing) {
            logger.warn(`[ClassService] [updateClass] Không tìm thấy | ID: ${id}`);
            throw new AppException({
                ...errorMessages.NOT_FOUND,
                message: 'Không tìm thấy lớp học'
            });
        }

        // Nếu cập nhật tên, kiểm tra trùng lặp
        if (validatedData.name && validatedData.name !== existing.name) {
            const exists = await classRepository.existsByNameExcludingId(validatedData.name, id);
            if (exists) {
                logger.warn(`[ClassService] [updateClass] Đã tồn tại | Name: ${validatedData.name}`);
                throw new AppException({
                    message: `Lớp học "${validatedData.name}" đã tồn tại`,
                    statusCode: 409,
                    errorCode: 'E10021'
                });
            }
        }

        // Nếu cập nhật teacher_id, kiểm tra giáo viên có tồn tại không
        if (validatedData.teacher_id) {
            const teacherExists = await classRepository.teacherExists(validatedData.teacher_id);
            if (!teacherExists) {
                logger.warn(`[ClassService] [updateClass] Giáo viên không tồn tại | TeacherId: ${validatedData.teacher_id}`);
                throw new AppException({
                    ...errorMessages.NOT_FOUND,
                    message: 'Không tìm thấy giáo viên'
                });
            }
        }

        const updated = await classRepository.update(id, validatedData);

        logger.info(`[ClassService] [updateClass] Thành công | ID: ${id}`);
        return updated;
    }

    /**
     * Xóa mềm lớp học
     */
    async softDeleteClass(id) {
        logger.info(`[ClassService] [softDeleteClass] Bắt đầu | ID: ${id}`);

        // Validate ID
        ClassIdParamDto.parse({ id });

        // Kiểm tra lớp học có tồn tại không
        const existing = await classRepository.findById(id);
        if (!existing) {
            logger.warn(`[ClassService] [softDeleteClass] Không tìm thấy | ID: ${id}`);
            throw new AppException({
                ...errorMessages.NOT_FOUND,
                message: 'Không tìm thấy lớp học'
            });
        }

        await classRepository.softDelete(id);

        logger.info(`[ClassService] [softDeleteClass] Thành công | ID: ${id}`);
        return true;
    }

    /**
     * Xóa cứng lớp học (chỉ dùng cho admin)
     */
    async hardDeleteClass(id) {
        logger.info(`[ClassService] [hardDeleteClass] Bắt đầu | ID: ${id}`);

        // Validate ID
        ClassIdParamDto.parse({ id });

        // Kiểm tra lớp học có tồn tại không
        const existing = await classRepository.findById(id);
        if (!existing) {
            logger.warn(`[ClassService] [hardDeleteClass] Không tìm thấy | ID: ${id}`);
            throw new AppException({
                ...errorMessages.NOT_FOUND,
                message: 'Không tìm thấy lớp học'
            });
        }

        await classRepository.delete(id);

        logger.info(`[ClassService] [hardDeleteClass] Thành công | ID: ${id}`);
        return true;
    }

    /**
     * Lấy danh sách học sinh trong lớp
     */
    async getClassStudents(id, query) {
        logger.info(`[ClassService] [getClassStudents] Bắt đầu | ID: ${id}`);

        // Validate ID
        ClassIdParamDto.parse({ id });

        // Validate query
        const validatedQuery = ClassQueryDto.parse(query);

        // Kiểm tra lớp học có tồn tại không
        const existing = await classRepository.findById(id);
        if (!existing) {
            logger.warn(`[ClassService] [getClassStudents] Không tìm thấy | ID: ${id}`);
            throw new AppException({
                ...errorMessages.NOT_FOUND,
                message: 'Không tìm thấy lớp học'
            });
        }

        const result = await classRepository.findStudentsByClassId(id, {
            page: validatedQuery.page,
            limit: validatedQuery.limit,
            sortBy: validatedQuery.sortBy,
            order: validatedQuery.order
        });

        logger.info(`[ClassService] [getClassStudents] Thành công | ID: ${id} | Students: ${result.pagination.totalCount}`);
        return result;
    }

    /**
     * Thêm học sinh vào lớp
     */
    async addStudentToClass(classId, studentId) {
        logger.info(`[ClassService] [addStudentToClass] Bắt đầu | Class: ${classId}, Student: ${studentId}`);

        // Validate IDs
        ClassIdParamDto.parse({ id: classId });
        const StudentIdParamDto = z.object({
            id: z.coerce.bigint().positive('ID phải là số dương')
        });
        StudentIdParamDto.parse({ id: studentId });

        // Kiểm tra lớp học có tồn tại không
        const classExists = await classRepository.findById(classId);
        if (!classExists) {
            logger.warn(`[ClassService] [addStudentToClass] Không tìm thấy lớp | ID: ${classId}`);
            throw new AppException({
                ...errorMessages.NOT_FOUND,
                message: 'Không tìm thấy lớp học'
            });
        }

        // Kiểm tra học sinh có tồn tại không
        const studentExists = await prisma.student.count({
            where: { id: studentId, deleted_at: null }
        });
        if (!studentExists) {
            logger.warn(`[ClassService] [addStudentToClass] Không tìm thấy học sinh | ID: ${studentId}`);
            throw new AppException({
                ...errorMessages.NOT_FOUND,
                message: 'Không tìm thấy học sinh'
            });
        }

        // Kiểm tra học sinh đã trong lớp chưa
        const alreadyInClass = await classRepository.isStudentInClass(studentId, classId);
        if (alreadyInClass) {
            logger.warn(`[ClassService] [addStudentToClass] Học sinh đã trong lớp | Student: ${studentId}, Class: ${classId}`);
            throw new AppException({
                message: 'Học sinh đã trong lớp học này',
                statusCode: 409,
                errorCode: 'E10030'
            });
        }

        const result = await classRepository.addStudentToClass(studentId, classId);

        logger.info(`[ClassService] [addStudentToClass] Thành công`);
        return result;
    }

    /**
     * Xóa học sinh khỏi lớp
     */
    async removeStudentFromClass(classId, studentId) {
        logger.info(`[ClassService] [removeStudentFromClass] Bắt đầu | Class: ${classId}, Student: ${studentId}`);

        // Validate IDs
        ClassIdParamDto.parse({ id: classId });

        // Kiểm tra lớp học có tồn tại không
        const classExists = await classRepository.findById(classId);
        if (!classExists) {
            logger.warn(`[ClassService] [removeStudentFromClass] Không tìm thấy lớp | ID: ${classId}`);
            throw new AppException({
                ...errorMessages.NOT_FOUND,
                message: 'Không tìm thấy lớp học'
            });
        }

        const result = await classRepository.removeStudentFromClass(studentId, classId);

        if (result.count === 0) {
            logger.warn(`[ClassService] [removeStudentFromClass] Học sinh không trong lớp | Student: ${studentId}, Class: ${classId}`);
            throw new AppException({
                message: 'Học sinh không trong lớp học này',
                statusCode: 404,
                errorCode: 'E10031'
            });
        }

        logger.info(`[ClassService] [removeStudentFromClass] Thành công`);
        return result;
    }
}

module.exports = new ClassService();