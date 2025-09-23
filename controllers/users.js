const User = require("../models/user");
const {
  BAD_REQUEST,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
} = require("../utils/errors");

async function getUsers(req, res) {
  try {
    const users = await User.find({});
    return res.send(users);
  } catch (err) {
    console.error(
      `Error ${err.name} with the message ${err.message} has occurred while executing the code`
    );
    return res
      .status(INTERNAL_SERVER_ERROR)
      .send({ message: "An error has occurred on the server" });
  }
}

async function getUser(req, res) {
  try {
    const user = await User.findById(req.params.userId).orFail();
    return res.send(user);
  } catch (err) {
    console.error(
      `Error ${err.name} with the message ${err.message} has occurred while executing the code`
    );
    if (err.name === "DocumentNotFoundError") {
      return res.status(NOT_FOUND).send({ message: "User not found" });
    }
    if (err.name === "CastError") {
      return res.status(BAD_REQUEST).send({ message: "Invalid user ID" });
    }
    return res
      .status(INTERNAL_SERVER_ERROR)
      .send({ message: "An error has occurred on the server" });
  }
}

async function createUser(req, res) {
  try {
    const { name, avatar } = req.body;
    const user = await User.create({ name, avatar });
    return res.status(201).send(user);
  } catch (err) {
    console.error(
      `Error ${err.name} with the message ${err.message} has occurred while executing the code`
    );
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

module.exports = {
  getUsers,
  getUser,
  createUser,
};
