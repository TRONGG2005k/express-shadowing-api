const studentRepository = require('../repository/student.repository');
const { CreateStudentDto, UpdateStudentDto, StudentQueryDto, StudentIdParamDto, AddToClassDto } = require('../dto/create-student.dto');
const AppException = require('../../../error/exception/AppException');
const errorMessages = require('../../../error/error.message');
const logger = require('../../../utils/logger');

/**
 * Service xử lý business logic cho Student
 * Tất cả validation và error handling đều ở đây
 */
class StudentService {
    /**
     * Lấy danh sách học sinh
     */
    async getAllStudents(query) {
        logger.info(`[StudentService] [getAllStudents] Bắt đầu | Query: ${JSON.stringify(query)}`);

        // Validate query params
        const validatedQuery = StudentQueryDto.parse(query);

        // Nếu có classId, lấy theo lớp
        if (validatedQuery.classId) {
            const result = await studentRepository.findByClass({
                page: validatedQuery.page,
                limit: validatedQuery.limit,
                sortBy: validatedQuery.sortBy,
                order: validatedQuery.order,
                classId: validatedQuery.classId
            });
            logger.info(`[StudentService] [getAllStudents] Hoàn thành theo lớp | Tổng: ${result.pagination.totalCount}`);
            return result;
        }

        // Lấy tất cả
        const result = await studentRepository.findAll({
            page: validatedQuery.page,
            limit: validatedQuery.limit,
            search: validatedQuery.search,
            sortBy: validatedQuery.sortBy,
            order: validatedQuery.order
        });

        logger.info(`[StudentService] [getAllStudents] Hoàn thành | Tổng: ${result.pagination.totalCount}`);
        return result;
    }

    /**
     * Lấy học sinh theo ID
     */
    async getStudentById(id) {
        logger.info(`[StudentService] [getStudentById] Bắt đầu | ID: ${id}`);

        // Validate ID
        StudentIdParamDto.parse({ id });

        const student = await studentRepository.findById(id);

        if (!student) {
            logger.warn(`[StudentService] [getStudentById] Không tìm thấy | ID: ${id}`);
            throw new AppException({
                ...errorMessages.NOT_FOUND,
                message: 'Không tìm thấy học sinh'
            });
        }

        logger.info(`[StudentService] [getStudentById] Tìm thấy | ID: ${id}`);
        return student;
    }

    /**
     * Tạo mới học sinh
     */
    async createStudent(data) {
        logger.info(`[StudentService] [createStudent] Bắt đầu | Name: ${data?.full_name}`);

        // Validate data
        const validatedData = CreateStudentDto.parse(data);

        // Kiểm tra học sinh đã tồn tại chưa
        const exists = await studentRepository.existsByNameAndDob(validatedData.full_name, validatedData.dob);
        if (exists) {
            logger.warn(`[StudentService] [createStudent] Đã tồn tại | Name: ${validatedData.full_name}`);
            throw new AppException({
                message: `Học sinh "${validatedData.full_name}" đã tồn tại`,
                statusCode: 409,
                errorCode: 'E10004'
            });
        }

        // Kiểm tra số điện thoại đã tồn tại chưa (nếu có nhập)
        if (validatedData.phone) {
            const phoneExists = await studentRepository.existsByPhone(validatedData.phone);
            if (phoneExists) {
                logger.warn(`[StudentService] [createStudent] Số điện thoại đã tồn tại | Phone: ${validatedData.phone}`);
                throw new AppException({
                    message: `Số điện thoại "${validatedData.phone}" đã được sử dụng`,
                    statusCode: 409,
                    errorCode: 'E10008'
                });
            }
        }

        const created = await studentRepository.create(validatedData);

        logger.info(`[StudentService] [createStudent] Thành công | ID: ${created.id}`);
        return created;
    }

    /**
     * Cập nhật học sinh
     */
    async updateStudent(id, data) {
        logger.info(`[StudentService] [updateStudent] Bắt đầu | ID: ${id}`);

        // Validate ID
        StudentIdParamDto.parse({ id });

        // Validate data
        const validatedData = UpdateStudentDto.parse(data);

        // Kiểm tra học sinh có tồn tại không
        const existing = await studentRepository.findById(id);
        if (!existing) {
            logger.warn(`[StudentService] [updateStudent] Không tìm thấy | ID: ${id}`);
            throw new AppException({
                ...errorMessages.NOT_FOUND,
                message: 'Không tìm thấy học sinh'
            });
        }

        // Nếu cập nhật tên hoặc ngày sinh, kiểm tra trùng lặp (trừ ID hiện tại)
        if ((validatedData.full_name || validatedData.dob !== undefined) &&
            (validatedData.full_name !== existing.full_name || validatedData.dob !== existing.dob)) {
            const exists = await studentRepository.existsByNameAndDobExcludingId(
                validatedData.full_name || existing.full_name,
                validatedData.dob !== undefined ? validatedData.dob : existing.dob,
                id
            );
            if (exists) {
                logger.warn(`[StudentService] [updateStudent] Đã tồn tại | Name: ${validatedData.full_name}`);
                throw new AppException({
                    message: `Học sinh "${validatedData.full_name || existing.full_name}" đã tồn tại`,
                    statusCode: 409,
                    errorCode: 'E10005'
                });
            }
        }

        // Kiểm tra số điện thoại trùng lặp khi cập nhật (trừ ID hiện tại)
        if (validatedData.phone && validatedData.phone !== existing.phone) {
            const phoneExists = await studentRepository.existsByPhoneExcludingId(validatedData.phone, id);
            if (phoneExists) {
                logger.warn(`[StudentService] [updateStudent] Số điện thoại đã tồn tại | Phone: ${validatedData.phone}`);
                throw new AppException({
                    message: `Số điện thoại "${validatedData.phone}" đã được sử dụng`,
                    statusCode: 409,
                    errorCode: 'E10009'
                });
            }
        }

        const updated = await studentRepository.update(id, validatedData);

        logger.info(`[StudentService] [updateStudent] Thành công | ID: ${id}`);
        return updated;
    }

    /**
     * Xóa mềm học sinh
     */
    async softDeleteStudent(id) {
        logger.info(`[StudentService] [softDeleteStudent] Bắt đầu | ID: ${id}`);

        // Validate ID
        StudentIdParamDto.parse({ id });

        // Kiểm tra học sinh có tồn tại không
        const existing = await studentRepository.findById(id);
        if (!existing) {
            logger.warn(`[StudentService] [softDeleteStudent] Không tìm thấy | ID: ${id}`);
            throw new AppException({
                ...errorMessages.NOT_FOUND,
                message: 'Không tìm thấy học sinh'
            });
        }

        await studentRepository.softDelete(id);

        logger.info(`[StudentService] [softDeleteStudent] Thành công | ID: ${id}`);
        return true;
    }

    /**
     * Xóa cứng học sinh (chỉ dùng cho admin)
     */
    async hardDeleteStudent(id) {
        logger.info(`[StudentService] [hardDeleteStudent] Bắt đầu | ID: ${id}`);

        // Validate ID
        StudentIdParamDto.parse({ id });

        // Kiểm tra học sinh có tồn tại không
        const existing = await studentRepository.findById(id);
        if (!existing) {
            logger.warn(`[StudentService] [hardDeleteStudent] Không tìm thấy | ID: ${id}`);
            throw new AppException({
                ...errorMessages.NOT_FOUND,
                message: 'Không tìm thấy học sinh'
            });
        }

        await studentRepository.delete(id);

        logger.info(`[StudentService] [hardDeleteStudent] Thành công | ID: ${id}`);
        return true;
    }

    /**
     * Thêm học sinh vào lớp học
     */
    async addStudentToClass(studentId, classId) {
        logger.info(`[StudentService] [addStudentToClass] Bắt đầu | Student: ${studentId}, Class: ${classId}`);

        // Validate IDs
        StudentIdParamDto.parse({ id: studentId });
        AddToClassDto.parse({ class_id: classId });

        // Kiểm tra học sinh có tồn tại không
        const student = await studentRepository.findById(studentId);
        if (!student) {
            logger.warn(`[StudentService] [addStudentToClass] Không tìm thấy học sinh | ID: ${studentId}`);
            throw new AppException({
                ...errorMessages.NOT_FOUND,
                message: 'Không tìm thấy học sinh'
            });
        }

        // Kiểm tra lớp học có tồn tại không
        const classExists = await studentRepository.classExists(classId);
        if (!classExists) {
            logger.warn(`[StudentService] [addStudentToClass] Không tìm thấy lớp học | ID: ${classId}`);
            throw new AppException({
                ...errorMessages.NOT_FOUND,
                message: 'Không tìm thấy lớp học'
            });
        }

        // Kiểm tra học sinh đã trong lớp chưa
        const alreadyInClass = await studentRepository.isStudentInClass(studentId, classId);
        if (alreadyInClass) {
            logger.warn(`[StudentService] [addStudentToClass] Học sinh đã trong lớp | Student: ${studentId}, Class: ${classId}`);
            throw new AppException({
                message: 'Học sinh đã trong lớp học này',
                statusCode: 409,
                errorCode: 'E10006'
            });
        }

        const result = await studentRepository.addToClass(studentId, classId);

        logger.info(`[StudentService] [addStudentToClass] Thành công`);
        return result;
    }

    /**
     * Xóa học sinh khỏi lớp học
     */
    async removeStudentFromClass(studentId, classId) {
        logger.info(`[StudentService] [removeStudentFromClass] Bắt đầu | Student: ${studentId}, Class: ${classId}`);

        // Validate IDs
        StudentIdParamDto.parse({ id: studentId });
        AddToClassDto.parse({ class_id: classId });

        // Kiểm tra học sinh có tồn tại không
        const student = await studentRepository.findById(studentId);
        if (!student) {
            logger.warn(`[StudentService] [removeStudentFromClass] Không tìm thấy học sinh | ID: ${studentId}`);
            throw new AppException({
                ...errorMessages.NOT_FOUND,
                message: 'Không tìm thấy học sinh'
            });
        }

        const result = await studentRepository.removeFromClass(studentId, classId);

        if (result.count === 0) {
            logger.warn(`[StudentService] [removeStudentFromClass] Học sinh không trong lớp | Student: ${studentId}, Class: ${classId}`);
            throw new AppException({
                message: 'Học sinh không trong lớp học này',
                statusCode: 404,
                errorCode: 'E10007'
            });
        }

        logger.info(`[StudentService] [removeStudentFromClass] Thành công`);
        return result;
    }
}

module.exports = new StudentService();
