const success = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({
    ok: true,
    data
  });
};

const error = (res, message, statusCode = 400) => {
  return res.status(statusCode).json({
    ok: false,
    error: message
  });
};

module.exports = { success, error };