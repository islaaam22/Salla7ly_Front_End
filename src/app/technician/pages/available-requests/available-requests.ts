import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-available-requests',
  imports: [CommonModule, FormsModule],
  templateUrl: './available-requests.html',
  styleUrl: './available-requests.css',
})
export class AvailableRequests implements OnInit {
  requests: any[] = [];
  loading = true;
  errorMsg = '';

  // Modal
  showModal = false;
  selectedRequestId: number | null = null;
  bidPrice = '';
  bidTime = '';
  bidMessage = '';
  submitting = false;

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
    this.http.get(`${this.apiUrl}/requests/open`, { headers: this.authHeaders() }).subscribe({
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

  openBidModal(requestId: number) {
    this.selectedRequestId = requestId;
    this.bidPrice = '';
    this.bidTime = '';
    this.bidMessage = '';
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedRequestId = null;
  }

  submitBid() {
  if (!this.bidPrice || !this.bidMessage || !this.selectedRequestId) return;
  this.submitting = true;

  const body = {
    price: Number(this.bidPrice),
    estimatedDurationMinutes: this.bidTime ? Number(this.bidTime) : 60,
    proposalMessage: this.bidMessage
  };

  this.http.post(
    `${this.apiUrl}/requests/${this.selectedRequestId}/bids`,
    body,
    { headers: this.authHeaders() }
  ).subscribe({
    next: () => {
      this.submitting = false;
      this.closeModal();
      this.requests = this.requests.filter(r => r.id !== this.selectedRequestId);
    },
    error: (err) => {
      this.submitting = false;
      console.error('Bid error:', err);
    }
  });
}

  urgencyClass(urgency: string): string {
    switch ((urgency || '').toLowerCase()) {
      case 'high': return 'bg-danger text-white';
      case 'medium': return 'bg-warning text-dark';
      default: return 'bg-secondary text-white';
    }
  }

  urgencyLabel(urgency: string): string {
    switch ((urgency || '').toLowerCase()) {
      case 'high': return 'عاجل';
      case 'medium': return 'متوسط';
      default: return 'عادي';
    }
  }
}
