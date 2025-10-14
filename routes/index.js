const router = require("express").Router();
const userRouter = require("./users");
const clothingItemRouter = require("./clothingItem");
const { login, createUser } = require("../controllers/users");
const { NotFoundError } = require("../middlewares/error-handler");
const {
  validateAuthentication,
  validateUserBody,
} = require("../middlewares/validation");

router.get("/crash-test", () => {
  setTimeout(() => {
    throw new Error("Server will crash now");
  }, 0);
});

router.post("/signin", validateAuthentication, login);
router.post("/signup", validateUserBody, createUser);

router.use("/items", clothingItemRouter);

router.use("/users", userRouter);

router.use((req, res, next) =>
  next(new NotFoundError("Requested resource not found"))
);

module.exports = router;
