/**
 * Transaction Routes  –  /api/transactions
 * ──────────────────────────────────────────
 * All routes are protected by JWT authMiddleware.
 *
 * POST /api/transactions/convert  – FX quote (no balance change)
 * POST /api/transactions/create   – Execute payment (deducts balance)
 * GET  /api/transactions           – List user's transaction history
 */

const express = require("express");
const crypto = require("crypto");
const authMiddleware = require("../middleware/authMiddleware");
const db = require("../lib/db");
const { convert } = require("../services/fxService");

const router = express.Router();

// ─── Apply auth to every route in this router ────────────────────
router.use(authMiddleware);

// Markup fee percentage (1.5 %)
const MARKUP_PCT = 0.015;

// Helper: generate a unique ID
function genId() {
  return crypto.randomBytes(12).toString("hex");
}

// ─────────────────────────────────────────────────
// POST /api/transactions/convert
// Body: { localAmount, localCurrency, merchantId? }
//
// Returns an FX quote WITHOUT executing a payment.
// The client can display the quote before the user confirms.
// ─────────────────────────────────────────────────
router.post("/convert", async (req, res) => {
  try {
    const { localAmount, localCurrency, merchantId } = req.body;

    // ── Validation ──
    if (!localAmount || !localCurrency) {
      return res
        .status(400)
        .json({ message: "localAmount and localCurrency are required" });
    }
    if (typeof localAmount !== "number" || localAmount <= 0) {
      return res
        .status(400)
        .json({ message: "localAmount must be a positive number" });
    }

    // ── Look up user to get homeCurrency ──
    const user = db.get("users").find({ _id: req.user.id }).value();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const homeCurrency = user.homeCurrency || "INR";

    // ── Optionally validate merchantId (non-blocking for demo flexibility) ──
    if (merchantId) {
      const merchant = db.get("merchants").find({ _id: merchantId }).value();
      if (!merchant) {
        console.warn(`[convert] Unknown merchantId "${merchantId}" — proceeding anyway`);
      }
    }

    // ── FX conversion ──
    const { convertedAmount, fxRate } = await convert(
      localAmount,
      localCurrency,
      homeCurrency
    );

    // ── Add 1.5 % markup fee ──
    const fee = parseFloat((convertedAmount * MARKUP_PCT).toFixed(4));
    const homeAmount = parseFloat((convertedAmount + fee).toFixed(4));

    // 200 OK – quote only, nothing persisted
    return res.status(200).json({
      localAmount,
      localCurrency,
      homeCurrency,
      fxRate,
      convertedAmount,
      fee,
      homeAmount,
    });
  } catch (err) {
    console.error("[transactions/convert] Error:", err.message);
    return res.status(500).json({ message: err.message || "Server error" });
  }
});

// ─────────────────────────────────────────────────
// POST /api/transactions/create
// Body: {
//   localAmount, localCurrency, merchantId?,
//   homeAmount?,  fxRate?,  fee?          ← from a prior /convert call
// }
//
// If homeAmount is missing, the route recalculates it on the fly.
// Deducts homeAmount from user's balance in their homeCurrency.
// ─────────────────────────────────────────────────
router.post("/create", async (req, res) => {
  try {
    const {
      localAmount,
      localCurrency,
      merchantId,
      homeAmount: providedHome,
      fxRate: providedRate,
      fee: providedFee,
    } = req.body;

    // ── Validation ──
    if (!localAmount || !localCurrency) {
      return res
        .status(400)
        .json({ message: "localAmount and localCurrency are required" });
    }
    if (typeof localAmount !== "number" || localAmount <= 0) {
      return res
        .status(400)
        .json({ message: "localAmount must be a positive number" });
    }

    // ── Look up user ──
    const user = db.get("users").find({ _id: req.user.id }).value();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const homeCurrency = user.homeCurrency || "INR";

    // ── Determine amounts (recalculate if not provided) ──
    let fxRate, fee, homeAmount;

    if (providedHome && providedRate && providedFee !== undefined) {
      fxRate = providedRate;
      fee = providedFee;
      homeAmount = providedHome;
    } else {
      const fx = await convert(localAmount, localCurrency, homeCurrency);
      fxRate = fx.fxRate;
      fee = parseFloat((fx.convertedAmount * MARKUP_PCT).toFixed(4));
      homeAmount = parseFloat((fx.convertedAmount + fee).toFixed(4));
    }

    // ── Check sufficient funds ──
    const balances = user.balances || {};
    const currentBalance = balances[homeCurrency] || 0;

    if (currentBalance < homeAmount) {
      return res.status(402).json({
        message: `Insufficient ${homeCurrency} balance. Available: ${currentBalance}, Required: ${homeAmount}`,
        available: currentBalance,
        required: homeAmount,
      });
    }

    // ── Deduct balance ──
    const newBalance = parseFloat((currentBalance - homeAmount).toFixed(4));
    balances[homeCurrency] = newBalance;

    db.get("users")
      .find({ _id: req.user.id })
      .assign({ balances })
      .write();

    // ── Save transaction record ──
    const transaction = {
      _id: genId(),
      userId: req.user.id,
      merchantId: merchantId || null,
      localAmount,
      localCurrency,
      homeAmount,
      homeCurrency,
      fxRate,
      fee,
      status: "completed",
      createdAt: new Date().toISOString(),
    };

    db.get("transactions").push(transaction).write();

    // 201 Created
    return res.status(201).json({
      message: "Payment successful",
      transaction,
      updatedBalance: {
        currency: homeCurrency,
        balance: newBalance,
      },
    });
  } catch (err) {
    console.error("[transactions/create] Error:", err.message);
    return res.status(500).json({ message: err.message || "Server error" });
  }
});

// ─────────────────────────────────────────────────
// GET /api/transactions
// Query params (optional): ?limit=20&offset=0&status=completed
//
// Returns the authenticated user's transaction history.
// ─────────────────────────────────────────────────
router.get("/", (req, res) => {
  try {
    const { limit = 50, offset = 0, status } = req.query;

    let txns = db
      .get("transactions")
      .filter({ userId: req.user.id })
      .value();

    // Optional status filter
    if (status) {
      txns = txns.filter((t) => t.status === status);
    }

    // Sort newest-first
    txns.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Paginate
    const paged = txns.slice(Number(offset), Number(offset) + Number(limit));

    return res.status(200).json({
      total: txns.length,
      offset: Number(offset),
      limit: Number(limit),
      transactions: paged,
    });
  } catch (err) {
    console.error("[transactions/list] Error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
