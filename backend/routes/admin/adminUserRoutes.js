const router = require("express").Router();
const { adminProtect } = require("../../middlewares/adminAuth");
const {
  getAllUsers,
  getUserStats,
  toggleBlockUser,
  updateUserRole,
  deleteUser
} = require("../../controllers/admin/adminUserController");

router.use(adminProtect);

router.get("/", getAllUsers);
router.get("/stats", getUserStats);
router.patch("/:id/block", toggleBlockUser);
router.patch("/:id/role", updateUserRole);
router.delete("/:id", deleteUser);

module.exports = router;