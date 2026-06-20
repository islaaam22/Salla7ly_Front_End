import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RequestService } from '../../services/bid-api';
import { BiddingSignalRService } from '../../services/bidding-signalr';
import { Auth } from '../../services/auth';
import { ServiceRequest, Category, RequestsByCategory } from '../../models/request.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-received-bids',
  templateUrl: './received-bids.html',
  styleUrls: ['./received-bids.css'],
  imports: [FormsModule, CommonModule],
})
export class ReceivedBidsComponent implements OnInit, OnDestroy {
  groupedRequests: RequestsByCategory[] = [];
  isLoading = true;
  private destroy$ = new Subject<void>();

  bidCounts: { [requestId: number]: number } = {};

  constructor(
    private requestService: RequestService,
    private signalR: BiddingSignalRService,
    private auth: Auth,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.signalR.disconnect();
  }

  private loadData(): void {
    console.log('🟢 loadData called');
    forkJoin({
    requests: this.requestService.getMyRequests(),
    categories: this.requestService.getCategories()
  }).pipe(takeUntil(this.destroy$))
    .subscribe({
      next: ({ requests, categories }) => {
        const openRequests = requests.filter(r => r.status === 'open');
        this.groupByCategory(openRequests, categories);
        this.isLoading = false;

        // جيب عدد العروض الفعلي لكل طلب
        this.loadInitialBidCounts(openRequests);

        this.connectSignalR().then(() => {
          openRequests.forEach(r => this.signalR.joinRequest(r.id));
        });
      },
      error: () => { this.isLoading = false; }
    });
}

private loadInitialBidCounts(requests: ServiceRequest[]): void {
  requests.forEach(req => {
    this.requestService.getBidsByRequest(req.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (bids) => {
          this.bidCounts[req.id] = bids.length;
        },
        error: () => {
          this.bidCounts[req.id] = 0;
        }
      });
  });
  }

  private groupByCategory(requests: ServiceRequest[], categories: Category[]): void {
    const map = new Map<number, RequestsByCategory>();

    requests.forEach((req) => {
      if (!map.has(req.categoryId)) {
        const category = categories.find((c) => c.id === req.categoryId) ?? {
          id: req.categoryId,
          name: 'غير محدد',
        };
        map.set(req.categoryId, { category, requests: [], totalBids: 0 });
      }
      map.get(req.categoryId)!.requests.push(req);
    });

    this.groupedRequests = Array.from(map.values());
  }

  private connectSignalR(): Promise<void> {
    const token = this.auth.getToken();
    if (!token) return Promise.resolve();

    if (this.signalR.isConnected) {
      this.subscribeToLiveUpdates();
      return Promise.resolve();
    }

    return this.signalR.connect(token).then(() => {
      this.subscribeToLiveUpdates();
    });
  }

  private subscribeToLiveUpdates(): void {
    this.signalR.newBidReceived$.pipe(takeUntil(this.destroy$)).subscribe((bid) => {
      this.bidCounts[bid.serviceRequestId] = (this.bidCounts[bid.serviceRequestId] || 0) + 1;
    });

    this.signalR.bidCountUpdated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ requestId, count }) => {
        this.bidCounts[requestId] = count;
      });
  }

  // كاتيجوري واحدة بس → روح على أول طلب فيها (الصفحة هتعرض كل طلبات الكاتيجوري دي)
  goToCategory(group: RequestsByCategory): void {
    this.router.navigate(['/customer/bids-category', group.category.id]);
  }

  getBidCount(requests: ServiceRequest[]): number {
    return requests.reduce((sum, r) => sum + (this.bidCounts[r.id] ?? 0), 0);
  }

  getUrgencyLabel(urgency: string): string {
    const labels: Record<string, string> = {
      low: 'عادي',
      medium: 'عاجل',
      high: 'طارئ',
    };
    return labels[urgency] ?? urgency;
  }
}
