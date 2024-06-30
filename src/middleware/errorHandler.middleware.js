const ApiError = require('../utils/ApiError.js');

const errorHandler = (err, req, res, next) => {
    // If the error is an instance of ApiError, use its properties
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: err.success,
            message: err.message,
            errors: err.errors,
            data: err.data,
        });
    }

    // For unexpected errors, return a generic 500 error
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'An unexpected error occurred. Please try again later.',
    });
};

module.exports = errorHandler;
