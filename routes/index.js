const router = require("express").Router();
const userRouter = require("./users");
const clothingItemRouter = require("./clothingItem");
const { login, createUser } = require("../controllers/users");
const { createError } = require("../utils/errors");

router.post("/signin", login);
router.post("/signup", createUser);

router.use("/items", clothingItemRouter);

router.use("/users", userRouter);

router.use((req, res, next) =>
  next(createError("not_found", "Requested resource not found"))
);

module.exports = router;
