export const sendSuccess = (res, data, message = 'Success', statusCode = 200, meta = null) => {
  const response = {
    success: true,
    message,
    data,
  };
  if (meta) {
    response.meta = meta;
  }
  return res.status(statusCode).json(response);
};

export const sendCreated = (res, data, message = 'Resource created successfully') => {
  return sendSuccess(res, data, message, 201);
};

export const sendPaginated = (res, data, total, page = 1, limit = 20, message = 'Data retrieved successfully') => {
  const totalPages = Math.ceil(total / limit) || 1;
  const meta = {
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages,
    hasMore: Number(page) < totalPages,
  };
  return sendSuccess(res, data, message, 200, meta);
};

export const sendError = (res, message = 'Internal Server Error', statusCode = 500, code = 'ERROR', details = null) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details,
    },
  });
};
