import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface AdminWalletStatsDto {
  totalDeposits: number;
  totalWithdrawals: number;
  pendingBalance: number;
}

@Injectable({ providedIn: 'root' })
export class AdminWalletService {
  private readonly apiUrl = 'https://sala7ly.runasp.net/api/admin/wallet-stats';

  constructor(private http: HttpClient) {}

  getWalletStats(): Observable<ApiResponse<AdminWalletStatsDto>> {
    return this.http.get<ApiResponse<AdminWalletStatsDto>>(this.apiUrl);
  }
}
