const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");
const User = require("../models/user");
const {
  BAD_REQUEST,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
} = require("../utils/errors");

async function createUser(req, res) {
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
      return res.status(409).send({ message: "Email already registerd" });
    }

    if (err.name === "ValidationError") {
      return res.status(BAD_REQUEST).send({
        message: "Invalid data passed to the method for creating a user",
      });
    }
    return res
      .status(INTERNAL_SERVER_ERROR)
      .send({ message: "An error has occurred on the server" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findUserByCredentials(email, password);

    const token = jwt.sign({ _id: user._id.toString() }, JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.send({ token });
  } catch (err) {
    return res.status(401).send({ message: "Invalid email or password" });
  }
}

async function getCurrentUser(req, res) {
  try {
    const me = await User.findById(req.user._id);

    if (!me) return res.status(404).send({ message: "User not found" });
    return res.send(me);
  } catch (err) {
    return res.status(500).send({ message: "Server error" });
  }
}

async function updateCurrentUser(req, res) {
  try {
    const { name, avatar } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { name, avatar },
      { new: true, runValidators: true } // enable validators on update
    );
    if (!updated) return res.status(404).send({ message: "User not found" });
    return res.send(updated);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).send({ message: "Invalid user data" });
    }
    return res.status(500).send({ message: "Server error" });
  }
}

module.exports = {
  createUser,
  login,
  getCurrentUser,
  updateCurrentUser,
};
