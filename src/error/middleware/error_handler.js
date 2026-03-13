const logger = require("../../utils/logger");


function errorHandler(err, req, res, next) {
    logger.error(err);

    const status = err.statusCode || 500;

    res.status(status).json({
        message: err.message || "Internal Server Error",
        status: status,
        error_code: err.errorCode || "E99999"
    });
}

module.exports = errorHandler;