const { AppError, INTERNAL_SERVER_ERROR } = require("../utils/errors");

module.exports = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  if (err instanceof AppError) {
    // In production would put if (process.env.NODE_ENV !== "production") console.error(err)
    console.error(err);
    return res.status(err.statusCode).send({ message: err.message });
  }

  if (err && typeof err.statusCode === "number") {
    console.error(err);
    return res.status(err.statusCode).send({ message: err.message });
  }

  // All unknown errors

  console.error(err);
  return res
    .status(INTERNAL_SERVER_ERROR)
    .send({ message: "An error has occured on the server" });
};
