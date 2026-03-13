const UserModel = require('../repository/user.model');
const AppException = require('../../../error/exception/AppException');
const errorMessages = require('../../../error/error.message');
const logger = require('../../../utils/logger');

const UserService = {
    /**
     * Lấy danh sách tất cả users
     */
    getAll() {
        logger.info('[UserService] [getAll] Gọi model lấy danh sách users');
        const users = UserModel.getAll();
        logger.info(`[UserService] [getAll] Lấy thành công ${users.length} users`);
        return users;
    },

    /**
     * Lấy user theo ID
     */
    getById(id) {
        logger.info(`[UserService] [getById] Gọi model lấy user | ID: ${id}`);
        const user = UserModel.getById(id);
        if (user) {
            logger.info(`[UserService] [getById] Tìm thấy user | ID: ${id}`);
        } else {
            logger.warn(`[UserService] [getById] Không tìm thấy user | ID: ${id}`);
            throw new AppException({
                ...errorMessages.NOT_FOUND,
                message: 'Không tìm thấy user'
            });
        }
        return user;
    },

    /**
     * Lấy user theo username
     */
    getByUsername(username) {
        logger.info(`[UserService] [getByUsername] Gọi model lấy user | Username: ${username}`);
        const user = UserModel.getByUsername(username);
        if (user) {
            logger.info(`[UserService] [getByUsername] Tìm thấy user | Username: ${username}`);
        } else {
            logger.warn(`[UserService] [getByUsername] Không tìm thấy user | Username: ${username}`);
        }
        return user;
    },

    /**
     * Tạo mới user
     */
    create(userData) {
        logger.info(`[UserService] [create] Bắt đầu tạo user | Username: ${userData.username}`);
        
        // Kiểm tra username đã tồn tại chưa
        const existing = UserModel.getByUsername(userData.username);
        if (existing) {
            logger.warn(`[UserService] [create] Username đã tồn tại | Username: ${userData.username}`);
            throw new AppException({
                message: 'Username đã tồn tại',
                statusCode: 409,
                errorCode: 'E10002'
            });
        }
        
        const newUser = UserModel.create(userData);
        logger.info(`[UserService] [create] Tạo user thành công | ID: ${newUser.id}`);
        return newUser;
    },

    /**
     * Cập nhật user
     */
    update(id, userData) {
        logger.info(`[UserService] [update] Bắt đầu cập nhật user | ID: ${id}`);
        
        // Kiểm tra user tồn tại
        const existing = UserModel.getById(id);
        if (!existing) {
            logger.warn(`[UserService] [update] Không tìm thấy user để cập nhật | ID: ${id}`);
            throw new AppException({
                ...errorMessages.NOT_FOUND,
                message: 'Không tìm thấy user'
            });
        }
        
        // Kiểm tra username mới có trùng không
        if (userData.username && userData.username !== existing.username) {
            const usernameExists = UserModel.getByUsername(userData.username);
            if (usernameExists) {
                logger.warn(`[UserService] [update] Username mới đã tồn tại | Username: ${userData.username}`);
                throw new AppException({
                    message: 'Username đã tồn tại',
                    statusCode: 409,
                    errorCode: 'E10003'
                });
            }
        }
        
        const updated = UserModel.update(id, userData);
        logger.info(`[UserService] [update] Cập nhật user thành công | ID: ${id}`);
        return updated;
    },

    /**
     * Xóa user
     */
    delete(id) {
        logger.info(`[UserService] [delete] Bắt đầu xóa user | ID: ${id}`);
        
        // Kiểm tra user tồn tại
        const existing = UserModel.getById(id);
        if (!existing) {
            logger.warn(`[UserService] [delete] Không tìm thấy user để xóa | ID: ${id}`);
            throw new AppException({
                ...errorMessages.NOT_FOUND,
                message: 'Không tìm thấy user'
            });
        }
        
        const result = UserModel.delete(id);
        logger.info(`[UserService] [delete] Xóa user thành công | ID: ${id}`);
        return result;
    }
};

module.exports = UserService;
