const AppError = require('../utils/AppError');
const winston = require('winston');

// Setup simple logger for now
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

const notFound = (req, res, next) => {
  next(new AppError(`Not Found - ${req.originalUrl}`, 404));
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming or other unknown error: don't leak error details
    logger.error('ERROR 💥', err);
    res.status(500).json({
      success: false,
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;
    error.name = err.name;

    // Handle specific mongoose/mongo errors here if needed
    if (error.name === 'CastError') error = new AppError(`Invalid ${error.path}: ${error.value}.`, 400);
    if (error.code === 11000) {
      const value = error.errmsg ? error.errmsg.match(/(["'])(\\?.)*?\1/)[0] : 'value';
      error = new AppError(`Duplicate field value: ${value}. Please use another value!`, 400);
    }
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((el) => el.message);
      error = new AppError(`Invalid input data. ${errors.join('. ')}`, 400);
    }
    if (error.name === 'JsonWebTokenError') error = new AppError('Invalid token. Please log in again.', 401);
    if (error.name === 'TokenExpiredError') error = new AppError('Your token has expired! Please log in again.', 401);

    sendErrorProd(error, res);
  }
};

module.exports = { notFound, errorHandler };
