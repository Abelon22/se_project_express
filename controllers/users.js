const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");
const User = require("../models/user");
const { createError, mapMongooseError } = require("../utils/errors");

async function createUser(req, res, next) {
  try {
    const { email, password, name, avatar } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const createdUser = await User.create({
      email,
      name,
      avatar,
      password: hashedPassword,
    });

    const safe = createdUser.toObject();
    delete safe.password;

    return res.status(201).send(safe);
  } catch (err) {
    return next(
      mapMongooseError(err, {
        duplicateMessage: "Email already registered",
        validationMessage: "Invalid data passed to create user",
      }) || err
    );
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findUserByCredentials(email, password);

    const token = jwt.sign({ _id: user._id.toString() }, JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.send({ token });
  } catch (_err) {
    return next(createError("bad_request", "Invalid email or password"));
  }
}

async function getCurrentUser(req, res, next) {
  try {
    const me = await User.findById(req.user._id);

    if (!me) throw createError("not_found", "User not found");
    return res.send(me);
  } catch (err) {
    return next(
      mapMongooseError(err, {
        badIdMessage: "Invalid User Id",
      }) || err
    );
  }
}

async function updateCurrentUser(req, res, next) {
  try {
    const { name, avatar } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { name, avatar },
      { new: true, runValidators: true }
    );
    if (!updated) throw createError("not_found", "User not found");
    return res.send(updated);
  } catch (err) {
    return next(
      mapMongooseError(err, {
        badIdMessage: "Invalid User Id",
        validationMessage: "Invalid user data",
      }) || err
    );
  }
}

module.exports = {
  createUser,
  login,
  getCurrentUser,
  updateCurrentUser,
};
