const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");
const User = require("../models/user");
const {
  BadRequestError,
  NotFoundError,
  ConflictError,
} = require("../middlewares/error-handler");

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
    if (err.code === 11000) {
      return next(new ConflictError("Email already registered"));
    }
    if (err.name === "ValidationError") {
      return next(new BadRequestError("Invalid data passed to create user"));
    }
    return next(err);
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
    return next(new BadRequestError("Invalid email or password"));
  }
}

async function getCurrentUser(req, res, next) {
  try {
    const me = await User.findById(req.user._id);

    if (!me) throw new NotFoundError("User not found");
    return res.send(me);
  } catch (err) {
    if (err.name === "CastError") {
      return next(new BadRequestError("Invalid User Id"));
    }
    return next(err);
  }
}

async function updateCurrentUser(req, res, next) {
  try {
    const { name, avatar } = req.body;

    console.log(req.body);
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { name, avatar },
      { new: true, runValidators: true }
    );
    if (!updated) throw new NotFoundError("User not found");
    return res.send(updated);
  } catch (err) {
    if (err.name === "CastError") {
      return next(new BadRequestError("Invalid User Id"));
    }
    if (err.name === "ValidationError") {
      return next(new BadRequestError("Invalid user data"));
    }
    return next(err);
  }
}

module.exports = {
  createUser,
  login,
  getCurrentUser,
  updateCurrentUser,
};
