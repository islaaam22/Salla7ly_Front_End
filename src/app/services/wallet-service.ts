import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface WalletTransactionDto {
  id?: number;
  amount: number;
  balanceAfter?: number;
  type?: string;
  description?: string;
  createdAt?: string;
}

export interface WalletDto {
  balance: number;
  pendingBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  currency: string;
  transactions: WalletTransactionDto[];
}

@Injectable({ providedIn: 'root' })
export class WalletService {
  private readonly apiUrl = 'https://sala7ly.runasp.net/api/wallet';

  constructor(private http: HttpClient) {}

  getWallet(page = 1, pageSize = 20): Observable<ApiResponse<WalletDto>> {
    return this.http.get<ApiResponse<WalletDto>>(`${this.apiUrl}?page=${page}&pageSize=${pageSize}`);
  }

  topUp(amount: number, paymentMethodId = 'pm_card_visa'): Observable<ApiResponse<{ checkoutUrl?: string; sessionId?: string; clientSecret?: string; amount?: number }>> {
    return this.http.post<ApiResponse<{ checkoutUrl?: string; sessionId?: string; clientSecret?: string; amount?: number }>>(`${this.apiUrl}/topup`, {
      amount,
      paymentMethodId
    });
  }

  confirmTopUp(sessionId: string) {
    return this.http.get<ApiResponse<{ message?: string }>>(`${this.apiUrl}/confirm?session_id=${encodeURIComponent(sessionId)}`);
  }

  withdraw(amount: number, bankAccount: string): Observable<ApiResponse<{ message?: string }>> {
    return this.http.post<ApiResponse<{ message?: string }>>(`${this.apiUrl}/withdraw`, {
      amount,
      bankAccount
    });
  }
}
