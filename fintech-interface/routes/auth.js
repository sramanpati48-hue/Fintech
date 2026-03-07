const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Shared lowdb instance (initialised in lib/db.js)
const db = require("../lib/db");
const authMiddleware = require("../middleware/authMiddleware");

/**
 * Build the public-safe user object returned in auth responses.
 * Includes profileComplete flag so the frontend knows where to redirect.
 */
function publicUser(user) {
  return {
    id: user._id,
    email: user.email,
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    name: user.name || "",
    phone: user.phone || "",
    country: user.country || "",
    city: user.city || "",
    location: user.location || "",
    homeCurrency: user.homeCurrency || "INR",
    avatarColor: user.avatarColor || "",
    initials: user.initials || "",
    picture: user.picture || "",
    profileComplete: !!user.profileComplete,
  };
}

const router = express.Router();

// Helper: sign a JWT with the user's id, expires in 7 days
function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

// Helper: generate a unique ID
function genId() {
  return crypto.randomBytes(12).toString("hex");
}

// ──────────────────────────────────────────────
// POST /api/auth/register
// Body: { email, password }
// ──────────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Check for existing user
    const existing = db.get("users").find({ email: email.toLowerCase() }).value();
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Hash password (salt rounds = 12)
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = {
      _id: genId(),
      email: email.toLowerCase(),
      password: hashedPassword,
      homeCurrency: "INR",
      balances: {},
      createdAt: new Date().toISOString(),
    };

    db.get("users").push(user).write();

    const token = signToken(user._id);
    return res.status(201).json({
      token,
      user: publicUser(user),
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ──────────────────────────────────────────────
// POST /api/auth/login
// Body: { email, password }
// ──────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = db.get("users").find({ email: email.toLowerCase() }).value();
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user._id);
    return res.status(200).json({
      token,
      user: publicUser(user),
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ──────────────────────────────────────────────
// POST /api/auth/google
// Body: { credential, email }
// ──────────────────────────────────────────────
router.post("/google", async (req, res) => {
  try {
    const { credential, email } = req.body;

    if (!credential || !email) {
      return res.status(400).json({ message: "Google credential and email are required" });
    }

    // Verify the access token with Google
    const googleRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${credential}` },
    });

    if (!googleRes.ok) {
      return res.status(401).json({ message: "Invalid Google credential" });
    }

    const googleUser = await googleRes.json();

    if (googleUser.email.toLowerCase() !== email.toLowerCase()) {
      return res.status(401).json({ message: "Email mismatch" });
    }

    // Find or create user
    let user = db.get("users").find({ email: email.toLowerCase() }).value();
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = {
        _id: genId(),
        email: email.toLowerCase(),
        password: `google_${googleUser.sub}`,
        // Auto-populate name from Google profile
        firstName: googleUser.given_name || "",
        lastName: googleUser.family_name || "",
        name: googleUser.name || "",
        picture: googleUser.picture || "",
        initials: ((googleUser.given_name || "").charAt(0) + (googleUser.family_name || "").charAt(0)).toUpperCase(),
        homeCurrency: "INR",
        balances: {},
        profileComplete: false,
        createdAt: new Date().toISOString(),
      };
      db.get("users").push(user).write();
    }

    const token = signToken(user._id);
    return res.status(200).json({
      token,
      isNewUser,
      user: publicUser(user),
    });
  } catch (err) {
    console.error("Google auth error:", err);
    return res.status(401).json({ message: "Google authentication failed" });
  }
});

// ──────────────────────────────────────────────
// PUT /api/auth/profile
// Body: { firstName, lastName, phone, country, city, homeCurrency, avatarColor, ... }
// Protected — saves profile fields on the authenticated user
// ──────────────────────────────────────────────
router.put("/profile", authMiddleware, (req, res) => {
  try {
    const {
      firstName, lastName, name, phone, country, city,
      location, homeCurrency, avatarColor, initials,
    } = req.body;

    const user = db.get("users").find({ _id: req.user.id }).value();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Merge supplied fields
    const updates = {};
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (country !== undefined) updates.country = country;
    if (city !== undefined) updates.city = city;
    if (location !== undefined) updates.location = location;
    if (homeCurrency !== undefined) updates.homeCurrency = homeCurrency;
    if (avatarColor !== undefined) updates.avatarColor = avatarColor;
    if (initials !== undefined) updates.initials = initials;
    updates.profileComplete = true;
    updates.updatedAt = new Date().toISOString();

    db.get("users").find({ _id: req.user.id }).assign(updates).write();

    // Return the full updated user
    const updated = db.get("users").find({ _id: req.user.id }).value();
    return res.status(200).json({ user: publicUser(updated) });
  } catch (err) {
    console.error("Profile update error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ──────────────────────────────────────────────
// GET /api/auth/me
// Protected — returns the current user's profile
// ──────────────────────────────────────────────
router.get("/me", authMiddleware, (req, res) => {
  try {
    const user = db.get("users").find({ _id: req.user.id }).value();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user: publicUser(user) });
  } catch (err) {
    console.error("Me error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
