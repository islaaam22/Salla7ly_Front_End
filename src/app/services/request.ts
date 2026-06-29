import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RequestService {
  private apiUrl = 'https://sala7ly.runasp.net/api';

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  createRequest(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/requests`, data, {
      headers: this.getHeaders()
    });
  }

  getMyRequests(): Observable<any> {
    return this.http.get(`${this.apiUrl}/requests/mine`, {
      headers: this.getHeaders()
    });
  }

  getRequestById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/requests/${id}`, {
      headers: this.getHeaders()
    });
  }

  // GET /api/requests/open
  getOpenRequests(): Observable<any> {
    return this.http.get(`${this.apiUrl}/requests/open`, {
      headers: this.getHeaders()
    });
  }

  // PUT /api/requests/{id}/complete
  completeRequest(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/requests/${id}/complete`, {}, {
      headers: this.getHeaders()
    });
  }

  // PUT /api/requests/{id}/start
  startRequest(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/requests/${id}/start`, {}, {
      headers: this.getHeaders()
    });
  }

  getCategories(): Observable<any> {
    return this.http.get(`${this.apiUrl}/ServiceCategory`, {
      headers: this.getHeaders()
    });
  }

  getAssignedRequests(): Observable<any> {
    return this.http.get(`${this.apiUrl}/requests/assigned`, {
      headers: this.getHeaders()
    });
  }
}
