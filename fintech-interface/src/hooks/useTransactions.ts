/**
 * useTransactions — fetches paginated transaction history.
 *
 * Supports filtering by status and client-side search.
 */
import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import type { ApiTransaction, TransactionListResponse } from "../types/api";

interface UseTransactionsOptions {
  pageSize?: number;
}

interface UseTransactionsResult {
  transactions: ApiTransaction[];
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  setPage: (p: number) => void;
  setStatusFilter: (s: string) => void;
  statusFilter: string;
  refresh: () => void;
}

export function useTransactions(opts: UseTransactionsOptions = {}): UseTransactionsResult {
  const pageSize = opts.pageSize || 8;
  const [transactions, setTransactions] = useState<ApiTransaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = {
        limit: pageSize,
        offset: (page - 1) * pageSize,
      };
      if (statusFilter !== "all") params.status = statusFilter;

      const { data } = await api.get<TransactionListResponse>("/transactions", { params });
      setTransactions(data.transactions);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return {
    transactions,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    loading,
    error,
    setPage,
    setStatusFilter,
    statusFilter,
    refresh: fetchData,
  };
}
