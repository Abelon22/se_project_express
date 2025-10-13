const ClothingItem = require("../models/clothingItem");
const {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} = require("../middlewares/error-handler");

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

    console.log(item);
    return res.status(201).send(item);
  } catch (err) {
    if (err.name === "ValidationError") {
      return next(new BadRequestError("Invalid data for create item"));
    }
    return next(err);
  }
}

async function deleteItem(req, res, next) {
  try {
    const { itemId } = req.params;

    const item = await ClothingItem.findById(itemId);

    console.log("DELETING ITEM", item);

    if (!item) throw new NotFoundError("Item not found");

    if (item.owner.toString() !== req.user._id) {
      throw new ForbiddenError("Forbidden: this is not your item");
    }
    await ClothingItem.findByIdAndDelete(req.params.itemId).orFail();
    return res.send({ message: "Item deleted successfully" });
  } catch (err) {
    if (err.name === "CastError") {
      return next(new BadRequestError("Invalid ITEM ID"));
    }
    if (err.name === "DocumentNotFoundError") {
      return next(new NotFoundError("Item not found"));
    }
    return next(err);
  }
}

async function likeItem(req, res, next) {
  try {
    const item = await ClothingItem.findByIdAndUpdate(
      req.params.itemId,
      { $addToSet: { likes: req.user._id } },
      { new: true }
    ).orFail();

    console.log(item);
    return res.send(item);
  } catch (err) {
    if (err.name === "CastError") {
      return next(new BadRequestError("Invalid Item ID"));
    }
    if (err.name === "DocumentNotFoundError") {
      return next(new NotFoundError("Item not found"));
    }
    return next(err);
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
    if (err.name === "CastError") {
      return next(new BadRequestError("Invalid item ID"));
    }
    if (err.name === "DocumentNotFoundError") {
      return next(new NotFoundError("Item not found"));
    }
    return next(err);
  }
}

module.exports = {
  getItems,
  createItem,
  deleteItem,
  likeItem,
  dislikeItem,
};
