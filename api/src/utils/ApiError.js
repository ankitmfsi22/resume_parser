export class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true; 
  }

  static badRequest(msg, details) {
    return new ApiError(400, msg, details);
  }
  static notFound(msg = 'Resource not found') {
    return new ApiError(404, msg);
  }
  static internal(msg = 'Internal server error') {
    return new ApiError(500, msg);
  }
}