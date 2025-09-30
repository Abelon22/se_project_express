const router = require("express").Router();
const auth = require("../middlewares/auth");
const { getCurrentUser, updateCurrentUser } = require("../controllers/users");

router.use(auth);

router.get("/me", getCurrentUser);
router.patch("/me", updateCurrentUser);

module.exports = router;
