const userRepository = require('../repository/user.repository');
const { CreateUserDto, UpdateUserDto, UserQueryDto, UserIdParamDto } = require('../dto/create-user.dto');
const AppException = require('../../../error/exception/AppException');
const errorMessages = require('../../../error/error.message');
const logger = require('../../../utils/logger');

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

        // TODO: Hash password ở đây nếu cần
        // const passwordHash = await bcrypt.hash(validatedData.password, 10);

        const created = await userRepository.create({
            ...validatedData,
            password_hash: validatedData.password // Thay bằng passwordHash nếu đã hash
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

        // Xử lý password nếu có cập nhật
        let passwordHash = undefined;
        if (validatedData.password) {
            // TODO: Hash password nếu cần
            // passwordHash = await bcrypt.hash(validatedData.password, 10);
            passwordHash = validatedData.password;
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
}

module.exports = new UserService();