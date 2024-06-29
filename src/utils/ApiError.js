class ApiError extends Error {
    constructor(
        statusCode,
        message = "An unexpected error occurred. Please Try again later.",
        errors = [],
        stack = ''
    ) {
        super();
        this.statusCode = statusCode;
        this.message = message;
        this.data = null; // study more about this.data
        this.errors = errors;
        this.success = false;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }

}
module.exports = ApiError;