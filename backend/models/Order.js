const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      },
      name: String,
      image: String,
      quantity: Number,
      price: Number
    }
  ],

  totalAmount: { type: Number, required: true },
  
  shippingFee: { type: Number, default: 0 },

  shippingAddress: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },

  paymentMethod: {
    type: String,
    enum: ["COD", "PAYPAL"],
    required: true
  },

  paymentStatus: {
    type: String,
    enum: ["PENDING", "PAID", "FAILED"],
    default: "PENDING"
  },

  orderStatus: {
    type: String,
    enum: ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"],
    default: "PENDING"
  },

  paypalOrderId: String,
  paypalPaymentId: String,
  paypalCaptureId: String,

}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);