import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-available-requests',
  imports: [CommonModule],
  templateUrl: './available-requests.html',
  styleUrl: './available-requests.css',
})
export class AvailableRequests implements OnInit {
  requests: any[] = [];
  loading = true;
  errorMsg = '';
  applyingId: number | null = null;

  private apiUrl = 'https://sala7ly.runasp.net/api';

  constructor(
    private http: HttpClient,
    private authService: Auth,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadRequests();
  }

  private authHeaders(): HttpHeaders {
    let token = this.authService.getToken() || '';
    if (token.startsWith('Bearer ')) token = token.substring(7);
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }
  

  loadRequests() {
    this.loading = true;
    this.errorMsg = '';

    this.http.get(`${this.apiUrl}/requests/mine`, { headers: this.authHeaders() }).subscribe({
      next: (data: any) => {
        this.requests = Array.isArray(data) ? data : (data.items || []);
        this.loading = false;
      },
    error: (err: any) => {
        this.loading = false;
        if (err.status === 404 || err.status === 204) {
          this.requests = [];
        } else {
          this.errorMsg = 'تعذّر تحميل الطلبات المتاحة';
        }
      }
    });
  }


  applyToRequest(requestId: number) {
    this.applyingId = requestId;

    this.http.post(`${this.apiUrl}/Request/${requestId}/apply`, {}, { headers: this.authHeaders() }).subscribe({
      next: () => {
        this.applyingId = null;
        this.requests = this.requests.filter(r => r.id !== requestId);
      },
      error: () => {
        this.applyingId = null;
      }
    });
  }

  urgencyClass(urgency: string): string {
    switch ((urgency || '').toLowerCase()) {
      case 'urgent':
      case 'طارئ':
        return 'badge-urgent';
      case 'high':
      case 'عاجل':
        return 'badge-high';
      default:
        return 'badge-normal';
    }
  }
}