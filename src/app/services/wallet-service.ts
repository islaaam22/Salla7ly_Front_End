import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/** Generic envelope used by /api/wallet — likely shared by other Sala7ly endpoints too */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/** A single wallet transaction, as returned by GET /api/wallet */
export interface WalletTransaction {
  id: number;
  amount: number;
  balanceAfter: number;
  type: string; // e.g. 'deposit' — other values (withdrawal/payment/refund) not yet confirmed
  description: string;
  reference: string;
  createdOn: string;
}

/** The `data` payload of GET /api/wallet */
export interface WalletData {
  balance: number;
  pendingBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  currency: string;
  transactions: WalletTransaction[];
}

/**
 * `data` payload of POST /api/wallet/topup.
 * Not confirmed from a live response yet — kept flexible for a Stripe-style
 * checkout redirect until we capture the real shape the same way we did for GET /api/wallet.
 */
export interface TopUpData {
  url?: string;
  checkoutUrl?: string;
  redirectUrl?: string;
  sessionUrl?: string;
  sessionId?: string;
}

@Injectable({ providedIn: 'root' })
export class WalletService {
  private readonly apiUrl = 'https://sala7ly.runasp.net/api/wallet';

  constructor(private http: HttpClient) {}

  /** GET /api/wallet — balance + paginated transaction history for the logged-in user */
  getWallet(page = 1, pageSize = 20): Observable<ApiResponse<WalletData>> {
    return this.http.get<ApiResponse<WalletData>>(this.apiUrl, {
      params: { page, pageSize },
    });
  }

  /** POST /api/wallet/topup */
  topUp(amount: number, paymentMethodId: string): Observable<ApiResponse<TopUpData>> {
    return this.http.post<ApiResponse<TopUpData>>(`${this.apiUrl}/topup`, {
      amount,
      paymentMethodId,
    });
  }

  /** GET /api/wallet/confirm?session_id=... — called on the return leg after checkout */
  confirmTopUp(sessionId: string): Observable<ApiResponse<WalletData>> {
    return this.http.get<ApiResponse<WalletData>>(`${this.apiUrl}/confirm`, {
      params: { session_id: sessionId },
    });
  }

  extractBalance(res: ApiResponse<WalletData> | null | undefined): number {
    return res?.data?.balance ?? 0;
  }

  extractTransactions(res: ApiResponse<WalletData> | null | undefined): WalletTransaction[] {
    return res?.data?.transactions ?? [];
  }

  extractCheckoutUrl(res: ApiResponse<TopUpData> | null | undefined): string | null {
    const d = res?.data;
    if (!d) return null;
    return d.url ?? d.checkoutUrl ?? d.redirectUrl ?? d.sessionUrl ?? null;
  }
}
