class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    // status depends on the statusCode
    this.status = `${statusCode}`.startsWith(4) ? 'fail' : 'error';
    this.isOperational = true;

    // whenever the object is called, this will prevent it from appearing it in the stacktree.
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
