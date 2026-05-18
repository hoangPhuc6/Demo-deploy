const ApiError = require("../utils/ApiError");
const { verifyAccessToken } = require("../utils/tokens");

const auth = (req, res, next) => {
  try {
    const header = req.header("Authorization") || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) throw ApiError.unauthorized("Missing access token");

    const decoded = verifyAccessToken(token);
    req.user = {
      id: decoded.sub,
      role: decoded.role,
      username: decoded.username,
    };
    req.token = token;
    next();
  } catch (err) {
    next(err);
  }
};

const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role))
      return next(ApiError.forbidden("Insufficient permission"));
    next();
  };

module.exports = { auth, requireRole };
