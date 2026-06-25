const AppError = require('../utils/AppError');

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    const errorMessages = error.errors.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(', ');
    next(new AppError(`Validation failed: ${errorMessages}`, 400));
  }
};

module.exports = validate;
