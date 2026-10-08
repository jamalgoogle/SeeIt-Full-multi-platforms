const { z } = require('zod');

// Express 4 doesn't catch rejected promises from async handlers on its own.
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    return res.status(400).json({
      error: result.error.issues[0].message,
      details: result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    });
  }
  req[source] = result.data;
  next();
};

const idParam = z.object({ id: z.string().regex(/^\d{1,9}$/, 'Invalid id') });

module.exports = { asyncHandler, validate, idParam };
