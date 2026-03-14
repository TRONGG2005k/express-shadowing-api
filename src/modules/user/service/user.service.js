const bcrypt = require('bcrypt');
const userRepository = require('../repository/user.repository');
const studentRepository = require('../../student/repository/student.repository');
const teacherRepository = require('../../teacher/repository/teacher.repository');
const { CreateUserDto, UpdateUserDto, UserQueryDto, UserIdParamDto, CreateUserWithRefDto } = require('../dto/create-user.dto');
const AppException = require('../../../error/exception/AppException');
const errorMessages = require('../../../error/error.message');
const logger = require('../../../utils/logger');

// Cấu hình bcrypt
const SALT_ROUNDS = 10;

/**
 * Service xử lý business logic cho User
 * Tất cả validation và error handling đều ở đây
 */
class UserService {
    /**
     * Lấy danh sách users
     */
    async getAll(query) {
        logger.info(`[UserService] [getAll] Bắt đầu | Query: ${JSON.stringify(query)}`);

        // Validate query params
        const validatedQuery = UserQueryDto.parse(query);

        const result = await userRepository.findAll({
            page: validatedQuery.page,
            limit: validatedQuery.limit,
            search: validatedQuery.search,
            role: validatedQuery.role,
            is_active: validatedQuery.is_active,
            sortBy: validatedQuery.sortBy,
            order: validatedQuery.order
        });

        logger.info(`[UserService] [getAll] Hoàn thành | Tổng: ${result.pagination.totalCount}`);
        return result;
    }

    /**
     * Lấy user theo ID
     */
    async getById(id) {
        logger.info(`[UserService] [getById] Bắt đầu | ID: ${id}`);

        // Validate ID
        UserIdParamDto.parse({ id });

        const user = await userRepository.findById(id);

        if (!user) {
            logger.warn(`[UserService] [getById] Không tìm thấy | ID: ${id}`);
            throw new AppException({
                ...errorMessages.NOT_FOUND,
                message: 'Không tìm thấy user'
            });
        }

        logger.info(`[UserService] [getById] Tìm thấy | ID: ${id}`);
        return user;
    }

    /**
     * Lấy user theo username
     */
    async getByUsername(username) {
        logger.info(`[UserService] [getByUsername] Bắt đầu | Username: ${username}`);

        const user = await userRepository.findByUsername(username);

        if (!user) {
            logger.warn(`[UserService] [getByUsername] Không tìm thấy | Username: ${username}`);
        } else {
            logger.info(`[UserService] [getByUsername] Tìm thấy | Username: ${username}`);
        }

        return user;
    }

    /**
     * Kiểm tra ref_id có tồn tại trong bảng tương ứng không
     * @param {string} refType - Loại tham chiếu (student, teacher, admin)
     * @param {bigint} refId - ID tham chiếu
     */
    async validateRefId(refType, refId) {
        if (!refType || !refId) {
            return;
        }

        logger.info(`[UserService] [validateRefId] Kiểm tra | ref_type: ${refType}, ref_id: ${refId}`);

        let exists = false;
        let entityName = '';

        switch (refType) {
            case 'student':
                const student = await studentRepository.findById(refId);
                exists = !!student;
                entityName = 'học sinh';
                break;
            case 'teacher':
                const teacher = await teacherRepository.findById(refId);
                exists = !!teacher;
                entityName = 'giáo viên';
                break;
            case 'admin':
                // Admin không cần kiểm tra ref_id
                exists = true;
                break;
            default:
                throw new AppException({
                    message: `Ref type "${refType}" không hợp lệ`,
                    statusCode: 400,
                    errorCode: 'E10010'
                });
        }

        if (!exists) {
            logger.warn(`[UserService] [validateRefId] Không tìm thấy ${entityName} | ref_id: ${refId}`);
            throw new AppException({
                message: `Tài khoản phải thuộc về một ngườii sở hữu. Không tìm thấy ${entityName} với ID: ${refId}`,
                statusCode: 404,
                errorCode: 'E10011'
            });
        }

        logger.info(`[UserService] [validateRefId] Hợp lệ | ${entityName} tồn tại`);
    }

    /**
     * Tạo mới user
     */
    async create(data) {
        logger.info(`[UserService] [create] Bắt đầu | Username: ${data?.username}`);

        // Validate data
        const validatedData = CreateUserDto.parse(data);

        // Kiểm tra username đã tồn tại chưa
        const usernameExists = await userRepository.existsByUsername(validatedData.username);
        if (usernameExists) {
            logger.warn(`[UserService] [create] Username đã tồn tại | Username: ${validatedData.username}`);
            throw new AppException({
                message: `Username "${validatedData.username}" đã tồn tại`,
                statusCode: 409,
                errorCode: 'E10002'
            });
        }

        // Kiểm tra phone đã tồn tại chưa
        const phoneExists = await userRepository.existsByPhone(validatedData.phone);
        if (phoneExists) {
            logger.warn(`[UserService] [create] Số điện thoại đã tồn tại | Phone: ${validatedData.phone}`);
            throw new AppException({
                message: `Số điện thoại "${validatedData.phone}" đã được sử dụng`,
                statusCode: 409,
                errorCode: 'E10008'
            });
        }

        // Kiểm tra ref_id có tồn tại không nếu có ref_type
        if (validatedData.ref_type && validatedData.ref_id) {
            await this.validateRefId(validatedData.ref_type, validatedData.ref_id);
        }

        // Hash password trước khi lưu
        const passwordHash = await bcrypt.hash(validatedData.password, SALT_ROUNDS);

        const created = await userRepository.create({
            ...validatedData,
            password_hash: passwordHash
        });

        logger.info(`[UserService] [create] Thành công | ID: ${created.id}`);
        return created;
    }

    /**
     * Cập nhật user
     */
    async update(id, data) {
        logger.info(`[UserService] [update] Bắt đầu | ID: ${id}`);

        // Validate ID
        UserIdParamDto.parse({ id });

        // Validate data
        const validatedData = UpdateUserDto.parse(data);

        // Kiểm tra user có tồn tại không
        const existing = await userRepository.findById(id);
        if (!existing) {
            logger.warn(`[UserService] [update] Không tìm thấy | ID: ${id}`);
            throw new AppException({
                ...errorMessages.NOT_FOUND,
                message: 'Không tìm thấy user'
            });
        }

        // Kiểm tra username mới có trùng không (trừ ID hiện tại)
        if (validatedData.username && validatedData.username !== existing.username) {
            const usernameExists = await userRepository.existsByUsernameExcludingId(validatedData.username, id);
            if (usernameExists) {
                logger.warn(`[UserService] [update] Username đã tồn tại | Username: ${validatedData.username}`);
                throw new AppException({
                    message: `Username "${validatedData.username}" đã tồn tại`,
                    statusCode: 409,
                    errorCode: 'E10003'
                });
            }
        }

        // Kiểm tra phone mới có trùng không (trừ ID hiện tại)
        if (validatedData.phone && validatedData.phone !== existing.phone) {
            const phoneExists = await userRepository.existsByPhoneExcludingId(validatedData.phone, id);
            if (phoneExists) {
                logger.warn(`[UserService] [update] Số điện thoại đã tồn tại | Phone: ${validatedData.phone}`);
                throw new AppException({
                    message: `Số điện thoại "${validatedData.phone}" đã được sử dụng`,
                    statusCode: 409,
                    errorCode: 'E10009'
                });
            }
        }

        // Kiểm tra ref_id có tồn tại không nếu có ref_type thay đổi
        const refTypeChanged = validatedData.ref_type !== undefined && validatedData.ref_type !== existing.ref_type;
        const refIdChanged = validatedData.ref_id !== undefined && validatedData.ref_id !== existing.ref_id;

        if (refTypeChanged || refIdChanged) {
            const refTypeToValidate = validatedData.ref_type !== undefined ? validatedData.ref_type : existing.ref_type;
            const refIdToValidate = validatedData.ref_id !== undefined ? validatedData.ref_id : existing.ref_id;

            if (refTypeToValidate && refIdToValidate) {
                await this.validateRefId(refTypeToValidate, refIdToValidate);
            }
        }

        // Xử lý password nếu có cập nhật
        let passwordHash = undefined;
        if (validatedData.password) {
            // Hash password trước khi lưu
            passwordHash = await bcrypt.hash(validatedData.password, SALT_ROUNDS);
        }

        const updated = await userRepository.update(id, {
            ...validatedData,
            password_hash: passwordHash
        });

        logger.info(`[UserService] [update] Thành công | ID: ${id}`);
        return updated;
    }

    /**
     * Xóa mềm user (soft delete)
     */
    async softDelete(id) {
        logger.info(`[UserService] [softDelete] Bắt đầu | ID: ${id}`);

        // Validate ID
        UserIdParamDto.parse({ id });

        // Kiểm tra user có tồn tại không
        const existing = await userRepository.findById(id);
        if (!existing) {
            logger.warn(`[UserService] [softDelete] Không tìm thấy | ID: ${id}`);
            throw new AppException({
                ...errorMessages.NOT_FOUND,
                message: 'Không tìm thấy user'
            });
        }

        await userRepository.softDelete(id);

        logger.info(`[UserService] [softDelete] Thành công | ID: ${id}`);
        return true;
    }

    /**
     * Xóa cứng user (hard delete - chỉ dùng cho admin)
     */
    async hardDelete(id) {
        logger.info(`[UserService] [hardDelete] Bắt đầu | ID: ${id}`);

        // Validate ID
        UserIdParamDto.parse({ id });

        // Kiểm tra user có tồn tại không (kể cả đã soft delete)
        const existing = await userRepository.findById(id);
        if (!existing) {
            logger.warn(`[UserService] [hardDelete] Không tìm thấy | ID: ${id}`);
            throw new AppException({
                ...errorMessages.NOT_FOUND,
                message: 'Không tìm thấy user'
            });
        }

        await userRepository.delete(id);

        logger.info(`[UserService] [hardDelete] Thành công | ID: ${id}`);
        return true;
    }

    /**
     * Xóa user (alias cho softDelete - dùng cho API chuẩn)
     */
    async delete(id) {
        return this.softDelete(id);
    }

    /**
     * Tạo user với ref_id và ref_type bắt buộc
     * Dùng khi tạo user liên kết với student/teacher cụ thể
     */
    async createWithRef(data) {
        logger.info(`[UserService] [createWithRef] Bắt đầu | Username: ${data?.username}, ref_type: ${data?.ref_type}, ref_id: ${data?.ref_id}`);

        // Validate data với CreateUserWithRefDto (ref_id và ref_type bắt buộc)
        const validatedData = CreateUserWithRefDto.parse(data);

        // Kiểm tra username đã tồn tại chưa
        const usernameExists = await userRepository.existsByUsername(validatedData.username);
        if (usernameExists) {
            logger.warn(`[UserService] [createWithRef] Username đã tồn tại | Username: ${validatedData.username}`);
            throw new AppException({
                message: `Username "${validatedData.username}" đã tồn tại`,
                statusCode: 409,
                errorCode: 'E10002'
            });
        }

        // Kiểm tra phone đã tồn tại chưa
        const phoneExists = await userRepository.existsByPhone(validatedData.phone);
        if (phoneExists) {
            logger.warn(`[UserService] [createWithRef] Số điện thoại đã tồn tại | Phone: ${validatedData.phone}`);
            throw new AppException({
                message: `Số điện thoại "${validatedData.phone}" đã được sử dụng`,
                statusCode: 409,
                errorCode: 'E10008'
            });
        }

        // Kiểm tra ref_id có tồn tại không (bắt buộc phải có)
        await this.validateRefId(validatedData.ref_type, validatedData.ref_id);

        // Hash password trước khi lưu
        const passwordHash = await bcrypt.hash(validatedData.password, SALT_ROUNDS);

        const created = await userRepository.create({
            ...validatedData,
            password_hash: passwordHash
        });

        logger.info(`[UserService] [createWithRef] Thành công | ID: ${created.id} | ref_type: ${created.ref_type} | ref_id: ${created.ref_id}`);
        return created;
    }
}

module.exports = new UserService();
