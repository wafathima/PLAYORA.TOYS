const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },

  description: String,

  price: { type: Number, required: true },

  category: {
  type: String,
  required: true,
  enum: ["Educational Toy", "Outdoor", "Action", "Vehicle"]
},
  
  image: String,
  stock: { type: Number, default: 0 },

  isDeleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });




module.exports = mongoose.model("Product", productSchema);
