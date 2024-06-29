class ApiResponse {
    constructor(statusCode, data, message = "Everything went well") {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = "success";
    }
}
module.exports = ApiResponse;