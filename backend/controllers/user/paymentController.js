const User = require("../../models/User");
const { paypal, paypalClient } = require("../../config/paypal");
 

exports.createPayPalOrder = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("cart.product");

    if (!user || !user.cart.length) {
      return res.status(400).json({ 
        success: false, 
        message: "Cart is empty" 
      });
    }

    const totalAmount = user.cart.reduce((sum, item) => {
      if (!item.product) return sum;
      return sum + item.product.price * item.quantity;
    }, 0);

    if (totalAmount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid cart total" 
      });
    }

    const shippingFee = totalAmount > 0 ? 5 : 0;
    const finalTotal = (totalAmount + shippingFee).toFixed(2); 

    const request = new paypal.orders.OrdersCreateRequest();
request.prefer("return=representation");
request.requestBody({
  intent: "CAPTURE",
  purchase_units: [
    {
      amount: {
        currency_code: "USD",
        value: finalTotal
      }
    }
  ]
});

const order = await paypalClient.execute(request);


    res.status(201).json({
      success: true,
      orderId: order.result.id,
      amount: finalTotal
    });

  } catch (err) {
    console.error("PayPal order creation error:", err);
    next(err);
  }
};

exports.capturePayPalOrder = async (req, res) => {
  try {
    const { orderID } = req.body;

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

    const totalAmount = items.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    );

    const order = await Order.create({
      user: user._id,
      items,
      totalAmount,
      shippingFee: 5,
      paymentMethod: "PAYPAL",
      paymentStatus: "PAID",
      paypalOrderId: orderID,
      paypalCaptureId: capture.result.purchase_units[0].payments.captures[0].id
    });

    user.cart = [];
    await user.save();

    res.json({ success: true, order });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};
