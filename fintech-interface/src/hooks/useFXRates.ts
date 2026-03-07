/**
 * useFXRates — fetches cached live rates from the backend.
 *
 * Optionally accepts a base currency (default: user's homeCurrency or "EUR").
 * Auto-refreshes every 5 minutes.
 */
import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import type { FXRatesResponse } from "../types/api";

interface UseFXRatesResult {
  base: string;
  rates: Record<string, number>;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useFXRates(baseCurrency: string = "EUR"): UseFXRatesResult {
  const [base, setBase] = useState(baseCurrency);
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<FXRatesResponse>("/fx/rates", { params: { base: baseCurrency } });
      setBase(data.base);
      setRates(data.rates);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load FX rates");
    } finally {
      setLoading(false);
    }
  }, [baseCurrency]);

  useEffect(() => { fetchRates(); }, [fetchRates]);

  // Auto-refresh every 5 min
  useEffect(() => {
    const id = setInterval(fetchRates, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [fetchRates]);

  return { base, rates, loading, error, refresh: fetchRates };
}
