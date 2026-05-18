const ok = (res, data = null, status = 200) => {
  return res.status(status).json({
    status: "success",
    timestamp: new Date().toISOString(),
    data,
    error: null,
  });
};

const fail = (res, statusCode, message, details = undefined) => {
  return res.status(statusCode).json({
    status: "error",
    timestamp: new Date().toISOString(),
    data: null,
    error: { code: statusCode, message, details },
  });
};

module.exports = { ok, fail };
