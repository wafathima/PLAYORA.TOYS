const Order = require("../../models/Order");
const User = require("../../models/User");

const { paypalClient, paypal } = require('../../config/paypal');

exports.placeOrderCOD = async (req, res) => {
  try {
    const user = req.user;
    const { address } = req.body;


    if (!user || !user.cart || user.cart.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    await user.populate("cart.product");

    const validItems = user.cart.filter(
      item => item.product && item.product.isDeleted === false
    );

    if (validItems.length === 0) {
      return res.status(400).json({ message: "No valid products in cart" });
    }

    const orderItems = validItems.map(item => ({
      product: item.product._id,
      name: item.product.name,
      image: item.product.image,
      quantity: item.quantity,
      price: item.product.price
    }));

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const shippingFee = totalAmount > 0 ? 5 : 0;
    const finalTotal = totalAmount + shippingFee;

    const shippingAddress = address || null;

    const order = await Order.create({
      user: user._id,
      items: orderItems,
      totalAmount: finalTotal,
      shippingFee,
      paymentMethod: "COD",
      paymentStatus: "PENDING",
      orderStatus: "PENDING",
      shippingAddress: shippingAddress
    });

    user.cart = [];
    await user.save();

    console.log("Order created successfully:", order._id); 

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order
    });

  } catch (err) {
    console.error("ORDER ERROR DETAILS:", {
      message: err.message,
      errors: err.errors,
      stack: err.stack
    });
    res.status(500).json({ 
      message: "Order creation failed", 
      error: err.message 
    });
  }
};

exports.capturePayPalPayment = async (req, res) => {
  try {
    const { orderID, address } = req.body;

    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    const capture = await paypalClient.execute(request);

    if (capture.result.status !== "COMPLETED") {
      return res.status(400).json({ success: false });
    }

    const user = await User.findById(req.user._id).populate("cart.product");

    const items = user.cart.map(item => ({
      product: item.product._id,
      name: item.product.name,
      image: item.product.image,
      quantity: item.quantity,
      price: item.product.price
    }));

    const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const shippingFee = total > 0 ? 5 : 0;

    const order = await Order.create({
      user: user._id,
      items,
      totalAmount: total + shippingFee,
      shippingFee,
      paymentMethod: "PAYPAL",
      paymentStatus: "PAID",
      orderStatus: "PROCESSING",
      paypalOrderId: orderID,
      paypalCaptureId: capture.result.purchase_units[0].payments.captures[0].id,
      paypalPaymentId: capture.result.id,
      shippingAddress: address || null
    });

    user.cart = [];
    await user.save();

    res.json({
      success: true,
      paymentId: order.paypalPaymentId,
      order
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product", "name price image")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (err) {
    next(err);
  }
};