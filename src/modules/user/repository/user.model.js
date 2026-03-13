const logger = require('../../../utils/logger');

// User Model - Simulating database operations with in-memory storage
class User {
    constructor(id, username, email, password, fullName) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.fullName = fullName;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
}

// In-memory storage for users
let users = [
    new User(1, 'john_doe', 'john@example.com', 'password123', 'John Doe'),
    new User(2, 'jane_smith', 'jane@example.com', 'password456', 'Jane Smith')
];
let nextId = 3;

logger.info(`[UserModel] Khởi tạo model với ${users.length} users mặc định`);

const UserModel = {
    // Get all users
    getAll() {
        logger.info(`[UserModel] [getAll] Lấy danh sách users | Tổng số: ${users.length}`);
        return users.map(user => ({
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            createdAt: user.createdAt
        }));
    },

    // Get user by ID
    getById(id) {
        logger.info(`[UserModel] [getById] Tìm user | ID: ${id}`);
        const user = users.find(u => u.id === parseInt(id));
        if (!user) {
            logger.warn(`[UserModel] [getById] Không tìm thấy user | ID: ${id}`);
            return null;
        }
        logger.info(`[UserModel] [getById] Tìm thấy user | ID: ${id} | Username: ${user.username}`);
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            createdAt: user.createdAt
        };
    },

    // Get user by username (for authentication)
    getByUsername(username) {
        logger.info(`[UserModel] [getByUsername] Tìm user | Username: ${username}`);
        const user = users.find(u => u.username === username);
        if (!user) {
            logger.warn(`[UserModel] [getByUsername] Không tìm thấy user | Username: ${username}`);
            return null;
        }
        logger.info(`[UserModel] [getByUsername] Tìm thấy user | Username: ${username} | ID: ${user.id}`);
        return user;
    },

    // Create new user
    create(userData) {
        logger.info(`[UserModel] [create] Tạo user mới | Username: ${userData.username}`);
        const newUser = new User(
            nextId++,
            userData.username,
            userData.email,
            userData.password,
            userData.fullName
        );
        users.push(newUser);
        logger.info(`[UserModel] [create] Tạo user thành công | ID: ${newUser.id} | Username: ${newUser.username}`);
        return {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            fullName: newUser.fullName,
            createdAt: newUser.createdAt
        };
    },

    // Update user
    update(id, userData) {
        logger.info(`[UserModel] [update] Cập nhật user | ID: ${id}`);
        const index = users.findIndex(u => u.id === parseInt(id));
        if (index === -1) {
            logger.warn(`[UserModel] [update] Không tìm thấy user để cập nhật | ID: ${id}`);
            return null;
        }

        const oldUsername = users[index].username;
        users[index] = {
            ...users[index],
            ...userData,
            updatedAt: new Date()
        };
        logger.info(`[UserModel] [update] Cập nhật user thành công | ID: ${id} | Username: ${oldUsername} -> ${users[index].username}`);
        return {
            id: users[index].id,
            username: users[index].username,
            email: users[index].email,
            fullName: users[index].fullName,
            updatedAt: users[index].updatedAt
        };
    },

    // Delete user
    delete(id) {
        logger.info(`[UserModel] [delete] Xóa user | ID: ${id}`);
        const index = users.findIndex(u => u.id === parseInt(id));
        if (index === -1) {
            logger.warn(`[UserModel] [delete] Không tìm thấy user để xóa | ID: ${id}`);
            return false;
        }
        const deletedUser = users[index];
        users.splice(index, 1);
        logger.info(`[UserModel] [delete] Xóa user thành công | ID: ${id} | Username: ${deletedUser.username}`);
        return true;
    }
};

module.exports = UserModel;
