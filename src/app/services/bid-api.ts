import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ServiceRequest } from '../models/request.model';
import { Bid } from '../models/bid-models';
import { Auth } from './auth';

@Injectable({ providedIn: 'root' })
export class RequestService {
  private readonly baseUrl = 'https://sala7ly.runasp.net/api';

  constructor(private http: HttpClient, private auth: Auth) {}

  private authHeaders(): HttpHeaders {
    let token = this.auth.getToken() || '';
    if (token.startsWith('Bearer ')) token = token.substring(7);
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getMyRequests(): Observable<ServiceRequest[]> {
    return this.http.get<ServiceRequest[]>(
      `${this.baseUrl}/requests/mine`,
      { headers: this.authHeaders() }
    );
  }

  getBidsByRequest(requestId: number): Observable<Bid[]> {
    return this.http.get<{ success: boolean; data: Bid[] }>(
      `${this.baseUrl}/requests/${requestId}/bids`,
      { headers: this.authHeaders() }
    ).pipe(map(res => res.data));
  }

  acceptBid(bidId: number): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/bids/${bidId}/accept`, {},
      { headers: this.authHeaders() }
    );
  }

  rejectBid(bidId: number): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/bids/${bidId}/reject`, {},
      { headers: this.authHeaders() }
    );
  }

  getCategories(): Observable<{ id: number; name: string }[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/ServiceCategory`,
      { headers: this.authHeaders() }
    ).pipe(map(data => data.map(c => ({ id: c.id, name: c.nameAr }))));
  }

  getRequestsWithBidsByCategory(categoryId: number): Observable<{ request: ServiceRequest; bids: Bid[] }[]> {
    return this.getMyRequests().pipe(
      switchMap(requests => {
        const filtered = requests.filter(r => r.categoryId === categoryId && r.status === 'open');
        if (filtered.length === 0) return forkJoin([]) as Observable<any>;

        const calls = filtered.map(req =>
          this.getBidsByRequest(req.id).pipe(
            map(bids => ({ request: req, bids }))
          )
        );
        return forkJoin(calls);
      })
    );
  }
}
