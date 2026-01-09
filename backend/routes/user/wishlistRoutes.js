const router = require("express").Router();
const { userProtect } = require("../../middlewares/userAuth");
const {
  addToWishlist,
  removeFromWishlist,
  getWishlist
} = require("../../controllers/user/wishlistController");

router.use(userProtect);

router.get("/", getWishlist);
router.post("/add/:productId", addToWishlist);
router.delete("/remove/:productId", removeFromWishlist);

module.exports = router;
