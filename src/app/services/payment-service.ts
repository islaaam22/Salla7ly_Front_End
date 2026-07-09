import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface CreatePaymentResultDto {
  clientSecret?: string;
  escrowId?: number;
  amount?: number;
}

export interface EscrowDto {
  id?: number;
  requestId?: number;
  amount?: number;
  platformFee?: number;
  technicianPayout?: number;
  status?: string;
  depositedAt?: string;
  releasedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly apiUrl = 'https://sala7ly.runasp.net/api/payments';

  constructor(private http: HttpClient) {}

  createEscrow(requestId: number): Observable<ApiResponse<CreatePaymentResultDto>> {
    return this.http.post<ApiResponse<CreatePaymentResultDto>>(`${this.apiUrl}/create`, { requestId });
  }

  releasePayment(requestId: number): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/release`, { requestId });
  }

  refundPayment(requestId: number): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/refund`, { requestId });
  }

  getEscrow(requestId: number): Observable<ApiResponse<EscrowDto>> {
    return this.http.get<ApiResponse<EscrowDto>>(`${this.apiUrl}/${requestId}`);
  }
}
