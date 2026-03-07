/**
 * Balance Routes  –  /api/balances
 * ─────────────────────────────────
 * All routes are protected by JWT authMiddleware.
 *
 * GET  /api/balances      – Retrieve the user's full balances map
 * POST /api/balances/add  – Simulate a top-up / deposit
 */

const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const db = require("../lib/db");

const router = express.Router();

// ─── Apply auth to every route in this router ────────────────────
router.use(authMiddleware);

// ─────────────────────────────────────────────────
// GET /api/balances
//
// Returns the authenticated user's balances map.
// Example response:
//   { balances: { INR: 45000, USD: 120.50, EUR: 80 } }
// ─────────────────────────────────────────────────
router.get("/", (req, res) => {
  try {
    const user = db.get("users").find({ _id: req.user.id }).value();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      homeCurrency: user.homeCurrency || "INR",
      balances: user.balances || {},
    });
  } catch (err) {
    console.error("[balances/get] Error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
});

// ─────────────────────────────────────────────────
// POST /api/balances/add
// Body: { currency, amount }
//
// Simulates a top-up / deposit.
// Adds `amount` to the user's balance in `currency`.
// If the currency doesn't exist yet it is initialised to `amount`.
// ─────────────────────────────────────────────────
router.post("/add", (req, res) => {
  try {
    const { currency, amount } = req.body;

    // ── Validation ──
    if (!currency || amount === undefined) {
      return res
        .status(400)
        .json({ message: "currency and amount are required" });
    }

    if (typeof amount !== "number" || amount <= 0) {
      return res
        .status(400)
        .json({ message: "amount must be a positive number" });
    }

    const currencyCode = currency.toUpperCase();

    // ── Look up user ──
    const user = db.get("users").find({ _id: req.user.id }).value();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ── Update balance ──
    const balances = user.balances || {};
    const previous = balances[currencyCode] || 0;
    balances[currencyCode] = parseFloat((previous + amount).toFixed(4));

    db.get("users")
      .find({ _id: req.user.id })
      .assign({ balances })
      .write();

    // 200 OK
    return res.status(200).json({
      message: `${currencyCode} balance topped up successfully`,
      currency: currencyCode,
      previous,
      added: amount,
      newBalance: balances[currencyCode],
      allBalances: balances,
    });
  } catch (err) {
    console.error("[balances/add] Error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
