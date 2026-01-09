const router = require("express").Router();
const { adminProtect } = require("../../middlewares/adminAuth");
const {
  getAllOrders,
  updateOrderStatus
} = require("../../controllers/admin/adminOrderController");

router.use(adminProtect);

router.get("/", getAllOrders);
router.put("/:id/status", updateOrderStatus);

module.exports = router;
