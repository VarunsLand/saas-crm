const ApiError = require('../utils/ApiError');

/**
 * Global Express error handling middleware.
 * Intercepts all rejected promises, thrown ApiErrors, and Prisma database failures.
 */
const globalErrorHandler = (err, req, res, next) => {
  console.error("GLOBAL ERROR HANDLER:", err);
  let statusCode = err.statusCode || 500;
  let errorType = err.name || 'InternalServerError';
  let message = err.message || 'An unexpected server error occurred.';

  // 1. Handle our custom standardized ApiError
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    errorType = 'ApiError';
  } 
  // 2. Handle known Prisma Client failures
  else if (err.code) {
    if (err.code === 'P2002') {
      // Unique constraint violation
      statusCode = 409;
      errorType = 'ConflictError';
      
      // Safely attempt to extract the specific fields that caused the collision
      const targetFields = err.meta && err.meta.target
        ? (Array.isArray(err.meta.target) ? err.meta.target.join(', ') : err.meta.target)
        : 'a field';
      message = `A database conflict occurred. The provided value for ${targetFields} already exists in the system.`;
    } 
    else if (err.code === 'P2025') {
      // Record not found during an update or delete
      statusCode = 404;
      errorType = 'NotFoundError';
      message = 'The requested resource was not found or is outside of your workspace boundaries.';
    }
  }

  // 3. Construct the secure production-ready payload
  const responsePayload = {
    error: errorType,
    message: message
  };

  // 4. Inject raw stack traces safely for developers only
  if (process.env.NODE_ENV !== 'production') {
    responsePayload.stack = err.stack;
  }

  // Return formatted JSON
  res.status(statusCode).json(responsePayload);
};

module.exports = globalErrorHandler;
