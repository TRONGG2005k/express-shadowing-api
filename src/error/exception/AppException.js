class AppException extends Error {
    constructor({ message, statusCode = 500, errorCode }) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppException;