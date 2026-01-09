const router = require("express").Router();
const { userProtect } = require("../../middlewares/userAuth");
const {
  addToCart,
  removeFromCart,
  getCart,
  updateCartQuantity 
} = require("../../controllers/user/cartController");

router.use(userProtect);

router.get("/", getCart);
router.post("/add/:productId", addToCart);
router.delete("/remove/:productId", removeFromCart);
router.put("/update/:productId", updateCartQuantity);

module.exports = router;
