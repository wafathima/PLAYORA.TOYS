const router = require("express").Router();
const { adminLogin } = require("../../controllers/admin/adminAuthController");

router.post("/login", adminLogin);

router.post("/logout", (req, res) => {
  res.json({
    success: true,
    message: "Logged out successfully"
  });
});

module.exports = router;