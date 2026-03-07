/**
 * QR payload parser.
 *
 * Primary format:  "MID:merchant-123|AMT:49.99|CUR:EUR"
 * Fallback:        JSON  { merchantId, merchantName?, localAmount, localCurrency }
 *
 * Throws a descriptive error when the payload is not parseable.
 */
import type { QRPaymentData } from "../types/api";

/** Regex for the pipe-delimited format */
const PIPE_RE = /^MID:([^|]+)\|AMT:([\d.]+)\|CUR:([A-Z]{3})$/;

export class QRParseError extends Error {
  constructor(message: string, public readonly raw: string) {
    super(message);
    this.name = "QRParseError";
  }
}

export function parseQRPayload(raw: string): QRPaymentData {
  const trimmed = raw.trim();
  if (!trimmed) throw new QRParseError("Empty QR payload", raw);

  /* ── 1. Try pipe-delimited format: MID:xxx|AMT:49.99|CUR:EUR ── */
  const pipeMatch = PIPE_RE.exec(trimmed);
  if (pipeMatch) {
    const merchantId = pipeMatch[1];
    const localAmount = parseFloat(pipeMatch[2]);
    const localCurrency = pipeMatch[3];

    if (isNaN(localAmount) || localAmount <= 0) {
      throw new QRParseError(`Invalid amount "${pipeMatch[2]}"`, raw);
    }

    return { merchantId, localAmount, localCurrency };
  }

  /* ── 2. Try JSON format ── */
  try {
    const obj = JSON.parse(trimmed);
    if (obj.merchantId && obj.localAmount && obj.localCurrency) {
      return {
        merchantId: String(obj.merchantId),
        merchantName: obj.merchantName ? String(obj.merchantName) : undefined,
        localAmount: Number(obj.localAmount),
        localCurrency: String(obj.localCurrency).toUpperCase(),
      };
    }
  } catch {
    /* not JSON — fall through */
  }

  throw new QRParseError(
    `Unrecognised QR format. Expected "MID:…|AMT:…|CUR:…" or valid JSON.`,
    raw,
  );
}
