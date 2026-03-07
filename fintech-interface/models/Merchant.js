const mongoose = require("mongoose");

const merchantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Merchant name is required"],
      trim: true,
    },
    // Currencies the merchant can accept
    supportedCurrencies: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Merchant", merchantSchema);
