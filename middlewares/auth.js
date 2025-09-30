const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");
const { createError } = require("../utils/errors");

module.exports = function auth(req, res, next) {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return next(createError("unauthorized", "Authorization required"));
  }

  const token = authorization.replace("Bearer ", "");

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    req.user = payload;
    return next();
  } catch (_err) {
    return next(createError("unauthorized", "Invalid or expired token"));
  }
};
