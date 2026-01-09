const User = require("../../models/User");
const Product = require("../../models/Product");

exports.addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const productExists = await Product.findById(productId);
    if (!productExists)
      return res.status(404).json({ message: "Product not found" });

    const user = req.user;

    if (user.wishlist.map(String).includes(productId)) {
      return res.status(400).json({ message: "Already in wishlist" });
    }

    user.wishlist.push(productId);
    await user.save();

    res.json({
      success: true,
      message: "Added to wishlist",
      wishlist: user.wishlist
    });
  } catch (err) {
    next(err);
  }
};

exports.removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    req.user.wishlist = req.user.wishlist.filter(
      id => id.toString() !== productId
    );

    await req.user.save();

    res.json({
      success: true,
      message: "Removed from wishlist",
      wishlist: req.user.wishlist
    });
  } catch (err) {
    next(err);
  }
};

exports.getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("wishlist", "name price image");

    res.json({
      success: true,
      wishlist: user.wishlist
    });
  } catch (err) {
    next(err);
  }
};
