const ClothingItem = require("../models/clothingItem");
const { createError, mapMongooseError } = require("../utils/errors");

async function getItems(_req, res, next) {
  try {
    const items = await ClothingItem.find({});
    return res.send(items);
  } catch (err) {
    return next(err);
  }
}

async function createItem(req, res, next) {
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
    return next(
      mapMongooseError(err, {
        validationMessage: "Invalid data for create item",
      }) || err
    );
  }
}

async function deleteItem(req, res, next) {
  try {
    const { itemId } = req.params;

    const item = await ClothingItem.findById(itemId);

    if (!item) throw createError("not_found", "Item not found");

    if (item.owner.toString() !== req.user._id) {
      throw createError("forbidden", "Forbidden: this is not your item");
    }
    await ClothingItem.findByIdAndDelete(req.params.itemId).orFail();
    return res.send({ message: "Item deleted successfully" });
  } catch (err) {
    return next(
      mapMongooseError(err, {
        badIdMessage: "Invalid ITEM ID",
        notFoundMessage: "Item not found",
      }) || err
    );
  }
}

async function likeItem(req, res, next) {
  try {
    const item = await ClothingItem.findByIdAndUpdate(
      req.params.itemId,
      { $addToSet: { likes: req.user._id } },
      { new: true }
    ).orFail();
    return res.send(item);
  } catch (err) {
    return next(
      mapMongooseError(err, {
        badIdMessage: "Invalid Item ID",
        notFoundMessage: "Item not found",
      }) || err
    );
  }
}

async function dislikeItem(req, res, next) {
  try {
    const item = await ClothingItem.findByIdAndUpdate(
      req.params.itemId,
      { $pull: { likes: req.user._id } },
      { new: true }
    ).orFail();
    return res.send(item);
  } catch (err) {
    return next(
      mapMongooseError(err, {
        badIdMessage: "Invalid item ID",
        notFoundMessage: "Item not found",
      }) || err
    );
  }
}

module.exports = {
  getItems,
  createItem,
  deleteItem,
  likeItem,
  dislikeItem,
};
