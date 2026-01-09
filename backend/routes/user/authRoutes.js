const router = require("express").Router();
const { register, login } = require("../../controllers/user/authController");
const { userProtect } = require("../../middlewares/userAuth");

router.post("/register", register);
router.post("/login", login);

router.get("/me", userProtect, (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = router;