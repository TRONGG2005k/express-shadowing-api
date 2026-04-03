const logger = require("../../utils/logger");
const { ZodError } = require("zod");

function errorHandler(err, req, res, next) {
    if (err instanceof ZodError) {
        return res.status(400).json({
            status: 400,
            message: err.issues[0].message,
            errorCode: "E_VALIDATION"
        });
    }
    logger.error(err);

    const status = err.statusCode || 500;

    res.status(status).json({
        message: err.message || "Internal Server Error",
        status: status,
        errorCode: err.errorCode || "E99999"
    });
}

module.exports = errorHandler;