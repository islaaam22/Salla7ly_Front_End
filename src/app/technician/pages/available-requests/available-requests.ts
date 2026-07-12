import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Auth } from '../../../services/auth';
import { BiddingSignalRService } from '../../../services/bidding-signalr';

@Component({
  selector: 'app-available-requests',
  imports: [CommonModule, FormsModule],
  templateUrl: './available-requests.html',
  styleUrl: './available-requests.css',
})
export class AvailableRequests implements OnInit, OnDestroy {
  requests: any[] = [];
  loading = true;
  errorMsg = '';

  // bid modal
  showModal = false;
  selectedRequestId: number | null = null;
  bidPrice = '';
  bidTime = '';
  bidMessage = '';
  submitting = false;
  priceValidationError = '';

  // details (inline expand)
  expandedId: number | null = null;
  detailsLoading = false;
  selectedDetails: any = null;
  activeImage = '';

  private apiUrl = 'https://sala7ly.runasp.net/api';
  private apiBase = 'https://sala7ly.runasp.net';
  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private authService: Auth,
    private signalR: BiddingSignalRService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadRequests();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.signalR.disconnect();
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
        this.connectSignalR();
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

  private connectSignalR(): void {
    const token = this.authService.getToken();
    if (!token) return;

    const ready = this.signalR.isConnected
      ? Promise.resolve()
      : this.signalR.connect(token);

    ready.then(() => this.listenToLiveUpdates());
  }

  private listenToLiveUpdates(): void {
    this.signalR.bidAccepted$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ requestId }) => {
        this.requests = this.requests.filter(r => r.id !== requestId);
      });
  }

  // ── Inline details expand ──
  toggleDetails(requestId: number) {
    if (this.expandedId === requestId) {
      this.expandedId = null;
      this.selectedDetails = null;
      return;
    }

    this.expandedId = requestId;
    this.detailsLoading = true;
    this.selectedDetails = null;
    this.activeImage = '';

    this.http.get<any>(`${this.apiUrl}/requests/${requestId}`, { headers: this.authHeaders() })
      .subscribe({
        next: (data) => {
          this.selectedDetails = data;
          this.activeImage = data.imageUrls?.[0] ? this.fullUrl(data.imageUrls[0]) : '';
          this.detailsLoading = false;
        },
        error: () => {
          this.detailsLoading = false;
          this.errorMsg = 'تعذّر تحميل التفاصيل';
        }
      });
  }

  fullUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path.replace('http://localhost:5296', this.apiBase);
    return `${this.apiBase}${path}`;
  }

  setActiveImage(url: string) {
    this.activeImage = this.fullUrl(url);
  }

  // ── Bid modal ──
  openBidModal(requestId: number) {
    this.selectedRequestId = requestId;
    this.bidPrice = '';
    this.bidTime = '';
    this.bidMessage = '';
    this.priceValidationError = '';
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
        // Display backend error message to user
        this.priceValidationError = err.error?.message || err.error?.title || 'حدث خطأ أثناء تقديم العرض';
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