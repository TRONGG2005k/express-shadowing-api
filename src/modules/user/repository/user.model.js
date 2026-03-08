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

const UserModel = {
    // Get all users
    getAll() {
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
        const user = users.find(u => u.id === parseInt(id));
        if (!user) return null;
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
        return users.find(u => u.username === username);
    },

    // Create new user
    create(userData) {
        const newUser = new User(
            nextId++,
            userData.username,
            userData.email,
            userData.password,
            userData.fullName
        );
        users.push(newUser);
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
        const index = users.findIndex(u => u.id === parseInt(id));
        if (index === -1) return null;

        users[index] = {
            ...users[index],
            ...userData,
            updatedAt: new Date()
        };
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
        const index = users.findIndex(u => u.id === parseInt(id));
        if (index === -1) return false;
        users.splice(index, 1);
        return true;
    }
};

module.exports = UserModel;
