export const validateRequest = (schema) => async (req, res, next) => {
  try {
    const parsed = await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (parsed.body) req.body = parsed.body;
    if (parsed.query) req.query = parsed.query;
    if (parsed.params) req.params = parsed.params;

    next();
  } catch (error) {
    const details = error.errors?.map((err) => ({
      field: err.path.join('.').replace(/^(body|query|params)\./, ''),
      issue: err.message,
    })) || [{ issue: error.message }];

    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Invalid request payload or parameters.',
        details,
      },
    });
  }
};

export default validateRequest;
