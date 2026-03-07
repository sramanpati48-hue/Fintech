// ─── Load environment variables first ────────────────────────────
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

// Route imports
const authRoutes = require("./routes/auth");
const transactionRoutes = require("./routes/transactions");
const balanceRoutes = require("./routes/balances");
const fxRoutes = require("./routes/fx");

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5000",
  process.env.CORS_ORIGIN, // e.g. https://globepay.vercel.app
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (curl, Postman, same-origin)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(null, true); // permissive for hackathon; tighten in production
  },
  credentials: true,
}));
app.use(express.json()); // parse JSON request bodies

// ─── API Routes ──────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/balances", balanceRoutes);
app.use("/api/fx", fxRoutes);

// Health-check endpoint (handy for Postman / uptime monitors)
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Serve React build in production ─────────────────────────────
const BUILD_DIR = path.join(__dirname, "build");
app.use(express.static(BUILD_DIR));
// SPA fallback: any non-API route serves index.html
app.get("/{*splat}", (_req, res) => {
  res.sendFile(path.join(BUILD_DIR, "index.html"));
});

// ─── Start server (no external DB needed) ────────────────────────
app.listen(PORT, "0.0.0.0", () => {
  console.log("");
  console.log("===========================================");
  console.log("  GlobePay API is running!");
  console.log("");
  console.log(`  REST API : http://localhost:${PORT}/api`);
  console.log(`  Frontend : http://localhost:${PORT}`);
  console.log("  Database : db.json (local file)");
  console.log("===========================================");
  console.log("");
});
