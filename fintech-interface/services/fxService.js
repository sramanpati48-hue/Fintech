/**
 * FX Rate Service
 * ───────────────
 * Fetches live exchange rates from exchangerate-api.com and keeps
 * a lightweight in-memory cache so we don't hit the external API
 * on every request.
 *
 * Cache TTL: 5 minutes (configurable via FX_CACHE_TTL_MS env var)
 *
 * Usage:
 *   const { getRates, convert } = require("../services/fxService");
 *   const rates = await getRates("EUR");        // { base: "EUR", rates: { INR: 90.5, ... } }
 *   const amt   = await convert(100, "EUR", "INR"); // 100 EUR → INR
 */

const CACHE_TTL_MS = parseInt(process.env.FX_CACHE_TTL_MS, 10) || 5 * 60 * 1000; // 5 min

// In-memory cache: keyed by base currency
// { [base]: { fetchedAt: <timestamp>, data: { base, rates } } }
const cache = {};

/**
 * Fetch rates for a given base currency.
 * Returns cached data if still fresh, otherwise fetches from API.
 *
 * @param {string} base - ISO 4217 currency code (default "EUR")
 * @returns {Promise<{ base: string, rates: Record<string, number> }>}
 */
async function getRates(base = "EUR") {
  const key = base.toUpperCase();
  const now = Date.now();

  // Return from cache if it's still fresh
  if (cache[key] && now - cache[key].fetchedAt < CACHE_TTL_MS) {
    return cache[key].data;
  }

  // Fetch fresh rates from the free API
  const url = `https://api.exchangerate-api.com/v4/latest/${key}`;
  console.log(`[fxService] Fetching rates from ${url}`);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`FX API returned ${response.status}: ${response.statusText}`);
  }

  const json = await response.json();

  // Normalise and cache
  const data = {
    base: json.base,
    rates: json.rates, // e.g. { INR: 90.5, USD: 1.08, … }
  };

  cache[key] = { fetchedAt: now, data };
  console.log(`[fxService] Cached ${Object.keys(data.rates).length} rates for ${key}`);

  return data;
}

/**
 * Convert an amount from one currency to another using live rates.
 * Both currencies are looked up against the same base fetch.
 *
 * @param {number} amount       - Amount in `fromCurrency`
 * @param {string} fromCurrency - Source ISO 4217 code
 * @param {string} toCurrency   - Target ISO 4217 code
 * @returns {Promise<{ convertedAmount: number, fxRate: number }>}
 */
async function convert(amount, fromCurrency, toCurrency) {
  const from = fromCurrency.toUpperCase();
  const to = toCurrency.toUpperCase();

  if (from === to) {
    return { convertedAmount: amount, fxRate: 1 };
  }

  // Fetch based on the source currency so the rate for `to` is a direct multiplier
  const { rates } = await getRates(from);

  if (!rates[to]) {
    throw new Error(`No rate found for ${to} against base ${from}`);
  }

  const fxRate = rates[to];
  const convertedAmount = parseFloat((amount * fxRate).toFixed(4));

  return { convertedAmount, fxRate };
}

/**
 * Force-clear the cache (useful for testing).
 */
function clearCache() {
  Object.keys(cache).forEach((k) => delete cache[k]);
}

module.exports = { getRates, convert, clearCache };
