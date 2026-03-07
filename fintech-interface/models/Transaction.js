const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Merchant",
    },
    // Amount in the merchant's / local currency
    localAmount: {
      type: Number,
      required: true,
    },
    localCurrency: {
      type: String,
      required: true,
    },
    // Converted amount in user's home currency
    homeAmount: {
      type: Number,
    },
    // FX rate used for the conversion
    fxRate: {
      type: Number,
    },
    // Any fee applied to the transaction
    fee: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
