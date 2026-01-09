const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    
    role: { type: String, enum: ["user", "admin"], default: "user" },
    
    isBlocked: { type: Boolean, default: false },
    blockedAt: { Date },
    blockedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    lastLogin: { Date },
    loginCount: { type: Number, default: 0 },
    
    email: {
      type: String,
      required: true,
      unique: true
    },

    password: {
      type: String,
      required: true
    },

    phone: {
      type: String,
      default: ""
    },

    bio: {
      type: String,
      default: ""
    },
    
    profileImage: {
    type: String,
    default: "",
  },

    addresses: [
      {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        addressLine1: { type: String, required: true },
        addressLine2: { type: String, default: "" },
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, default: "India" },
        postalCode: { type: String, required: true },
        isDefault: { type: Boolean, default: false },
        type: { 
          type: String, 
          enum: ["home", "work", "other"],
          default: "home"
        },
        createdAt: { type: Date, default: Date.now }
      }
    ],
  
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      }
    ],

    cart: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product"
        },
        quantity: {
          type: Number,
          default: 1
        }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);