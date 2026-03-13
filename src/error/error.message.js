
const errorMessages = {
    INTERNAL_SERVER_ERROR: {
        statusCode: 500,
        message: 'An unexpected error occurred on the server.',
        errorCode: 'E10001'
    },
    BAD_REQUEST: {
        statusCode: 400,
        message: 'The request was invalid or cannot be served.',
        errorCode: 'E99999'
    },
    NOT_FOUND: {
        statusCode: 404,
        message: 'The requested resource was not found.',
        errorCode: 'E99991'
    }
}


module.exports = errorMessages;