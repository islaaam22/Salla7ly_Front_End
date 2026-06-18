import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Bid, SubmitBidDto } from '../models/bid-models';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

@Injectable({ providedIn: 'root' })
export class BidApiService {
  private readonly apiUrl = 'https://sala7ly.runasp.net/api';

  constructor(private http: HttpClient) {}

  submitBid(requestId: number, dto: SubmitBidDto): Observable<ApiResponse<Bid>> {
    return this.http.post<ApiResponse<Bid>>(
      `${this.apiUrl}/requests/${requestId}/bids`, dto
    );
  }

  getBidsByRequest(requestId: number): Observable<ApiResponse<Bid[]>> {
    return this.http.get<ApiResponse<Bid[]>>(
      `${this.apiUrl}/requests/${requestId}/bids`
    );
  }

  getBid(bidId: number): Observable<ApiResponse<Bid>> {
    return this.http.get<ApiResponse<Bid>>(`${this.apiUrl}/bids/${bidId}`);
  }

  acceptBid(bidId: number): Observable<ApiResponse<string>> {
    return this.http.put<ApiResponse<string>>(`${this.apiUrl}/bids/${bidId}/accept`, {});
  }

  rejectBid(bidId: number): Observable<ApiResponse<string>> {
    return this.http.put<ApiResponse<string>>(`${this.apiUrl}/bids/${bidId}/reject`, {});
  }

  withdrawBid(bidId: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.apiUrl}/bids/${bidId}`);
  }
}