/* eslint-disable max-classes-per-file */
const BAD_REQUEST = 400;
const UNAUTHORIZED = 401;
const FORBIDDEN = 403;
const NOT_FOUND = 404;
const CONFLICT = 409;
const INTERNAL_SERVER_ERROR = 500;

const KIND_TO_STATUS = {
  bad_request: BAD_REQUEST,
  unauthorized: UNAUTHORIZED,
  forbidden: FORBIDDEN,
  not_found: NOT_FOUND,
  conflict: CONFLICT,
  internal: INTERNAL_SERVER_ERROR,
};

const DEFAULT_MESSAGES = {
  bad_request: "Bad request",
  unauthorized: "Authorization required",
  forbidden: "Forbidden",
  not_found: "Resource not found",
  conflict: "Conflict",
  internal: "An error has occurred on the server",
};

class AppError extends Error {
  constructor({ message, kind = "internal", statusCode, meta } = {}) {
    super(message || DEFAULT_MESSAGES[kind] || DEFAULT_MESSAGES.internal);
    this.name = "AppError";
    this.kind = kind;
    this.statusCode =
      statusCode || KIND_TO_STATUS[kind] || INTERNAL_SERVER_ERROR;
    this.meta = meta;
   
    Error.captureStackTrace?.(this, this.constructor);
  }
}

class MongooseError extends AppError {
  constructor({ message, kind, statusCode, meta } = {}) {
    super({ message, kind, statusCode, meta });
    this.name = "MongooseError";
  }
}

function createError(kind, message, meta) {
  return new AppError({
    kind,
    message,
    meta,
    statusCode: KIND_TO_STATUS[kind],
  });
}

function createMongooseError(kind, message, meta) {
  return new MongooseError({
    kind,
    message,
    meta,
    statusCode: KIND_TO_STATUS[kind],
  });
}

function mapMongooseError(
  err,
  {
    badIdMessage = "Invalid ID",
    notFoundMessage = "Resource not found",
    duplicateMessage = "Duplicate key",
    validationMessage = "Invalid data",
  } = {}
) {
  if (!err) return null;

  if (err.code === 11000) {
    return createMongooseError("conflict", duplicateMessage, {
      keyValue: err.keyValue,
    });
  }

  if (err.name === "ValidationError") {
    const fieldErrors = Object.values(err.errors || {})
      .map((e) => e?.message)
      .filter(Boolean);
    return createMongooseError("bad_request", validationMessage, {
      fields: fieldErrors,
    });
  }

  if (err.name === "CastError") {
    return createMongooseError("bad_request", badIdMessage, {
      path: err.path,
      value: err.value,
    });
  }

  if (err.name === "DocumentNotFoundError") {
    return createMongooseError("not_found", notFoundMessage);
  }

  return null;
}

module.exports = {
  BAD_REQUEST,
  UNAUTHORIZED,
  FORBIDDEN,
  NOT_FOUND,
  CONFLICT,
  INTERNAL_SERVER_ERROR,

  AppError,
  MongooseError,

  createError,
  createMongooseError,

  mapMongooseError,
};
