/**
 * Shared lowdb database instance.
 * All route files should import this instead of creating their own.
 *
 * Collections:
 *   - users[]       : user accounts (auth, profile, balances)
 *   - transactions[] : payment / FX conversion records
 *   - merchants[]    : merchant catalogue
 */

const path = require("path");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const DB_PATH = path.join(__dirname, "..", "db.json");
const adapter = new FileSync(DB_PATH);
const db = low(adapter);

// Seed default collections if they don't exist yet
db.defaults({
  users: [],
  transactions: [],
  merchants: [
    {
      _id: "m001",
      name: "Café de Paris",
      supportedCurrencies: ["EUR", "USD"],
    },
    {
      _id: "m002",
      name: "Tokyo Electronics",
      supportedCurrencies: ["JPY", "USD"],
    },
    {
      _id: "m003",
      name: "London Books Ltd",
      supportedCurrencies: ["GBP", "EUR"],
    },
  ],
}).write();

module.exports = db;
