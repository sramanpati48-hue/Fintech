const jwt = require("jsonwebtoken");

/**
 * Express middleware that:
 *  1. Reads the Authorization header (Bearer <token>)
 *  2. Verifies the JWT
 *  3. Attaches the decoded userId to req.user
 */
module.exports = function authMiddleware(req, res, next) {
  const header = req.header("Authorization");

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided, access denied" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user id so downstream handlers can use it
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
