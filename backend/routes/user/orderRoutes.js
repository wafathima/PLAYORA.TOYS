const router = require("express").Router();
const { userProtect } = require("../../middlewares/userAuth");

const {
  placeOrderCOD,
  capturePayPalPayment,
  getMyOrders
} = require("../../controllers/user/orderController");

const {
  createPayPalOrder
} = require("../../controllers/user/paymentController");

router.use(userProtect);

router.post("/place", placeOrderCOD);

router.post("/paypal/create", createPayPalOrder); 
router.post("/paypal/capture", capturePayPalPayment);

router.get("/my", getMyOrders);

module.exports = router;
