/**
 * useConvert — mutation hook for FX conversion.
 *
 * Two-phase flow:
 *   1. getQuote()  → calls POST /api/transactions/convert → returns preview
 *   2. confirm()   → calls POST /api/transactions/create  → executes payment
 */
import { useState, useCallback } from "react";
import api from "../api/axios";
import type {
  ConvertQuotePayload,
  ConvertQuoteResponse,
  CreatePaymentPayload,
  CreatePaymentResponse,
} from "../types/api";

interface UseConvertResult {
  quote: ConvertQuoteResponse | null;
  receipt: CreatePaymentResponse | null;
  loading: boolean;
  error: string | null;
  /** Phase 1: get the FX preview (no balance change). */
  getQuote: (payload: ConvertQuotePayload) => Promise<ConvertQuoteResponse>;
  /** Phase 2: confirm and execute the payment (deducts balance). */
  confirm: (payload?: CreatePaymentPayload) => Promise<CreatePaymentResponse>;
  /** Reset to start a fresh conversion. */
  reset: () => void;
}

export function useConvert(): UseConvertResult {
  const [quote, setQuote] = useState<ConvertQuoteResponse | null>(null);
  const [receipt, setReceipt] = useState<CreatePaymentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getQuote = useCallback(async (payload: ConvertQuotePayload) => {
    setLoading(true);
    setError(null);
    setReceipt(null);
    try {
      const { data } = await api.post<ConvertQuoteResponse>("/transactions/convert", payload);
      setQuote(data);
      return data;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Quote failed";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const confirm = useCallback(async (overridePayload?: CreatePaymentPayload) => {
    if (!quote && !overridePayload) {
      throw new Error("No quote available. Call getQuote() first.");
    }
    setLoading(true);
    setError(null);
    try {
      // If no explicit payload, build one from the current quote
      const payload: CreatePaymentPayload = overridePayload || {
        localAmount: quote!.localAmount,
        localCurrency: quote!.localCurrency,
        homeAmount: quote!.homeAmount,
        fxRate: quote!.fxRate,
        fee: quote!.fee,
      };
      const { data } = await api.post<CreatePaymentResponse>("/transactions/create", payload);
      setReceipt(data);
      return data;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Payment failed";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [quote]);

  const reset = useCallback(() => {
    setQuote(null);
    setReceipt(null);
    setError(null);
  }, []);

  return { quote, receipt, loading, error, getQuote, confirm, reset };
}
