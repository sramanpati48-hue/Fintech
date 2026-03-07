/**
 * Shared TypeScript interfaces for all API responses.
 * Mirrors the backend data shapes from lowdb / routes.
 */

/* ─── User / Auth ─── */
export interface ApiUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  phone: string;
  country: string;
  city: string;
  location: string;
  homeCurrency: string;
  avatarColor: string;
  initials: string;
  picture: string;
  profileComplete: boolean;
}

export interface AuthResponse {
  token: string;
  user: ApiUser;
  isNewUser?: boolean;
}

export interface ProfileResponse {
  user: ApiUser;
}

/* ─── Balances ─── */
export interface BalancesResponse {
  homeCurrency: string;
  balances: Record<string, number>;
}

export interface TopUpPayload {
  currency: string;
  amount: number;
}

export interface TopUpResponse {
  message: string;
  currency: string;
  previous: number;
  added: number;
  newBalance: number;
  allBalances: Record<string, number>;
}

/* ─── Transactions ─── */
export interface ApiTransaction {
  _id: string;
  userId: string;
  merchantId: string | null;
  localAmount: number;
  localCurrency: string;
  homeAmount: number;
  homeCurrency: string;
  fxRate: number;
  fee: number;
  status: "pending" | "completed" | "failed";
  createdAt: string;
}

export interface TransactionListResponse {
  total: number;
  offset: number;
  limit: number;
  transactions: ApiTransaction[];
}

/* ─── FX Conversion ─── */
export interface ConvertQuotePayload {
  localAmount: number;
  localCurrency: string;
  merchantId?: string;
}

export interface ConvertQuoteResponse {
  localAmount: number;
  localCurrency: string;
  homeCurrency: string;
  fxRate: number;
  convertedAmount: number;
  fee: number;
  homeAmount: number;
}

export interface CreatePaymentPayload {
  localAmount: number;
  localCurrency: string;
  merchantId?: string;
  homeAmount?: number;
  fxRate?: number;
  fee?: number;
}

export interface CreatePaymentResponse {
  message: string;
  transaction: ApiTransaction;
  updatedBalance: {
    currency: string;
    balance: number;
  };
}

/* ─── FX Rates (from fxService) ─── */
export interface FXRatesResponse {
  base: string;
  rates: Record<string, number>;
}

/* ─── Parsed QR data shape ─── */
export interface QRPaymentData {
  merchantId: string;
  merchantName?: string;
  localAmount: number;
  localCurrency: string;
}
