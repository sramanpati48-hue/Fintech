/**
 * useDashboard — fetches balances + recent transactions for the main hub.
 *
 * Returns { balances, homeCurrency, recentTxns, totalBalanceUSD, loading, error, refresh }
 */
import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import type { BalancesResponse, ApiTransaction, TransactionListResponse } from "../types/api";

interface DashboardData {
  homeCurrency: string;
  balances: Record<string, number>;
  recentTxns: ApiTransaction[];
  totalBalanceUSD: number;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

// Rough USD conversion for display (same logic as the old mock)
const USD_RATES: Record<string, number> = {
  USD: 1, EUR: 1.083, GBP: 1.267, JPY: 0.00669, INR: 0.01203,
  AUD: 0.65, CAD: 0.74, CHF: 1.11, SGD: 0.74, AED: 0.27,
};

export function useDashboard(): DashboardData {
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [homeCurrency, setHomeCurrency] = useState("INR");
  const [recentTxns, setRecentTxns] = useState<ApiTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Parallel fetches
      const [balRes, txRes] = await Promise.all([
        api.get<BalancesResponse>("/balances"),
        api.get<TransactionListResponse>("/transactions", { params: { limit: 8 } }),
      ]);

      setBalances(balRes.data.balances);
      setHomeCurrency(balRes.data.homeCurrency);
      setRecentTxns(txRes.data.transactions);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalBalanceUSD = Object.entries(balances).reduce((sum, [cur, amt]) => {
    return sum + amt * (USD_RATES[cur] || 0.01);
  }, 0);

  return { balances, homeCurrency, recentTxns, totalBalanceUSD, loading, error, refresh: fetchData };
}
