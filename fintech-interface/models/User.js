const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    // Default home currency for FX conversions
    homeCurrency: {
      type: String,
      default: "INR",
    },
    // Dynamic map of currency → balance, e.g. { USD: 500, INR: 12000 }
    balances: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
