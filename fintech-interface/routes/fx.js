/**
 * FX Routes  –  /api/fx
 * ──────────────────────
 * Public routes (no auth required) for fetching live exchange rates.
 *
 * GET /api/fx/rates?base=EUR  → cached rates from exchangerate-api.com
 */

const express = require("express");
const { getRates } = require("../services/fxService");

const router = express.Router();

// ─────────────────────────────────────────────────
// GET /api/fx/rates?base=EUR
// Returns { base, rates } with in-memory 5-min cache.
// ─────────────────────────────────────────────────
router.get("/rates", async (req, res) => {
  try {
    const base = (req.query.base || "EUR").toString().toUpperCase();
    const data = await getRates(base);
    return res.status(200).json(data);
  } catch (err) {
    console.error("[fx/rates] Error:", err.message);
    return res.status(502).json({ message: err.message || "Failed to fetch FX rates" });
  }
});

module.exports = router;
