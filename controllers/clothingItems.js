const ClothingItem = require("../models/clothingItem");
const {
  BAD_REQUEST,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
} = require("../utils/errors");

async function getItems(req, res) {
  try {
    const items = await ClothingItem.find({});
    return res.send(items);
  } catch (err) {
    console.error(
      `Error ${err.name} with the message ${err.message} has occurred while executing the code`
    );
    return res
      .status(INTERNAL_SERVER_ERROR)
      .send({ message: "An error has occurred on the server" });
  }
}

async function createItem(req, res) {
  try {
    const { name, weather, imageUrl } = req.body;

    console.log(req.user._id);

    const item = await ClothingItem.create({
      name,
      weather,
      imageUrl,
      owner: req.user._id,
    });
    return res.status(201).send(item);
  } catch (err) {
    console.error(
      `Error ${err.name} with the message ${err.message} has occurred while executing the code`
    );
    if (err.name === "ValidationError") {
      return res.status(BAD_REQUEST).send({
        message: "Invalid data passed to the method for creating an item",
      });
    }
    return res
      .status(INTERNAL_SERVER_ERROR)
      .send({ message: "An error has occurred on the server" });
  }
}

async function deleteItem(req, res) {
  try {
    await ClothingItem.findByIdAndDelete(req.params.itemId).orFail();
    return res.send({ message: "Item deleted successfully" });
  } catch (err) {
    console.error(
      `Error ${err.name} with the message ${err.message} has occurred while executing the code`
    );
    if (err.name === "DocumentNotFoundError") {
      return res.status(NOT_FOUND).send({ message: "Item not found" });
    }
    if (err.name === "CastError") {
      return res.status(BAD_REQUEST).send({ message: "Invalid item ID" });
    }
    return res
      .status(INTERNAL_SERVER_ERROR)
      .send({ message: "An error has occurred on the server" });
  }
}

async function likeItem(req, res) {
  try {
    const item = await ClothingItem.findByIdAndUpdate(
      req.params.itemId,
      { $addToSet: { likes: req.user._id } }, // add _id to the array if it's not there yet
      { new: true }
    ).orFail();
    return res.send(item);
  } catch (err) {
    console.error(
      `Error ${err.name} with the message ${err.message} has occurred while executing the code`
    );
    if (err.name === "DocumentNotFoundError") {
      return res.status(NOT_FOUND).send({ message: "Item not found" });
    }
    if (err.name === "CastError") {
      return res.status(BAD_REQUEST).send({ message: "Invalid item ID" });
    }
    return res
      .status(INTERNAL_SERVER_ERROR)
      .send({ message: "An error has occurred on the server" });
  }
}

async function dislikeItem(req, res) {
  try {
    const item = await ClothingItem.findByIdAndUpdate(
      req.params.itemId,
      { $pull: { likes: req.user._id } }, // remove _id from the array
      { new: true }
    ).orFail();
    return res.send(item);
  } catch (err) {
    console.error(
      `Error ${err.name} with the message ${err.message} has occurred while executing the code`
    );
    if (err.name === "DocumentNotFoundError") {
      return res.status(NOT_FOUND).send({ message: "Item not found" });
    }
    if (err.name === "CastError") {
      return res.status(BAD_REQUEST).send({ message: "Invalid item ID" });
    }
    return res
      .status(INTERNAL_SERVER_ERROR)
      .send({ message: "An error has occurred on the server" });
  }
}

module.exports = {
  getItems,
  createItem,
  deleteItem,
  likeItem,
  dislikeItem,
};
