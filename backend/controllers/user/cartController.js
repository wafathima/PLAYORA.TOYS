const User = require("../../models/User");
const Product = require("../../models/Product");

exports.addToCart = async (req, res, next) => {
  try {
    const user = req.user;
    const { productId } = req.params;

    const productExists = await Product.findById(productId);
    if (!productExists)
      return res.status(404).json({ message: "Product not found" });

    const item = user.cart.find(
      (i) => i.product.toString() === productId
    );

    if (item) {
      item.quantity += 1;
    } else {
      user.cart.push({ product: productId, quantity: 1 });
    }

    await user.save();

    res.json({
      success: true,
      message: "Product added to cart",
      cart: user.cart
    });
  } catch (err) {
    next(err);
  }
};

exports.removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    req.user.cart = req.user.cart.filter(
      (i) => i.product.toString() !== productId
    );

    await req.user.save();

    res.json({
      success: true,
      message: "Product removed from cart",
      cart: req.user.cart
    });
  } catch (err) {
    next(err);
  }
};

exports.getCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("cart.product", "name price image isDeleted");

    const filteredCart = user.cart.filter(
      item => item.product && item.product.isDeleted === false
    );

    res.json({
      success: true,
      cart: filteredCart
    });
  } catch (err) {
    next(err);
  }
};

exports.updateCartQuantity = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ 
        success: false,
        message: "Quantity must be at least 1" 
      });
    }

    const user = req.user;
    
    const item = user.cart.find(
      (i) => i.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ 
        success: false,
        message: "Product not found in cart" 
      });
    }

    item.quantity = parseInt(quantity);
    await user.save();

    res.json({
      success: true,
      message: `Quantity updated to ${quantity}`,
      cart: user.cart
    });
  } catch (err) {
    next(err);
  }
};