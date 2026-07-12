import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BiddingSignalRService } from '../../services/bidding-signalr';
import { RequestService } from '../../services/bid-api';
import { Auth } from '../../services/auth';
import { Bid } from '../../models/bid-models';
import { ServiceRequest } from '../../models/request.model';
import { CommonModule } from '@angular/common';

interface RequestGroup {
  request: ServiceRequest;
  bids: Bid[];
}

@Component({
  selector: 'app-bids-by-category',
  templateUrl: './bids-by-category.html',
  styleUrl: './bids-by-category.css',
  imports: [CommonModule, RouterLink],
})
export class BidsByCategoryComponent implements OnInit, OnDestroy {
  categoryId!: number;
  groups: RequestGroup[] = [];
  isLoading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private requestService: RequestService,
    private signalR: BiddingSignalRService,
    private auth: Auth
  ) {}

  ngOnInit(): void {
    this.categoryId = +this.route.snapshot.paramMap.get('categoryId')!;
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.groups.forEach(g => this.signalR.leaveRequest(g.request.id));
  }

  private loadData(): void {
    this.requestService.getRequestsWithBidsByCategory(this.categoryId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (groups) => {
          this.groups = groups;
          this.isLoading = false;
          this.connectSignalR();
        },
        error: () => { this.isLoading = false; }
      });
  }

  private connectSignalR(): void {
    const token = this.auth.getToken();
    if (!token) return;

    const ready = this.signalR.isConnected
      ? Promise.resolve()
      : this.signalR.connect(token);

    ready.then(() => {
      this.groups.forEach(g => this.signalR.joinRequest(g.request.id));
      this.listenToLiveUpdates();
    });
  }

  private listenToLiveUpdates(): void {
    this.signalR.newBidReceived$
      .pipe(takeUntil(this.destroy$))
      .subscribe(bid => {
        const group = this.groups.find(g => g.request.id === bid.serviceRequestId);
        if (group && !group.bids.some(b => b.id === bid.id)) {
          group.bids = [bid, ...group.bids];
        }
      });

    this.signalR.bidAccepted$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ bidId, requestId }) => {
        const group = this.groups.find(g => g.request.id === requestId);
        if (group) {
          group.bids = group.bids.map(b =>
            b.id === bidId ? { ...b, status: 'accepted' } : { ...b, status: 'rejected' }
          );
        }
      });

    this.signalR.bidWithdrawn$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ bidId }) => {
        this.groups.forEach(g => {
          g.bids = g.bids.filter(b => b.id !== bidId);
        });
      });
  }

  acceptBid(group: RequestGroup, bidId: number): void {
    this.requestService.acceptBid(bidId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          group.bids = group.bids.map(b =>
            b.id === bidId ? { ...b, status: 'accepted' } : { ...b, status: 'rejected' }
          );
        }
      });
  }

  rejectingBidId: number | null = null;

  rejectBid(group: RequestGroup, bidId: number): void {
    if (this.rejectingBidId !== null) return;
    this.rejectingBidId = bidId;

    this.requestService.rejectBid(bidId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.rejectingBidId = null;
          group.bids = group.bids.map(b =>
            b.id === bidId ? { ...b, status: 'rejected' } : b
          );
        },
        error: () => {
          this.rejectingBidId = null;
        }
      });
  }

  /** Arabic relative time, e.g. "منذ 5 دقيقة" / "منذ ساعة" / "أمس" */
  timeAgo(dateStr?: string): string {
    if (!dateStr) return '';
    const time = new Date(dateStr).getTime();
    if (!Number.isFinite(time)) return '';

    const diffMs = Date.now() - time;
    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);

    if (diffMs < 0) return 'قريبًا';
    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours === 1) return 'منذ ساعة';
    if (hours < 24) return `منذ ${hours} ساعات`;
    if (days === 1) return 'أمس';
    return `منذ ${days} أيام`;
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} دقيقة`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h} ساعة و ${m} دقيقة` : `${h} ساعة`;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'قيد المراجعة', accepted: 'مقبول', rejected: 'مرفوض',
      withdrawn: 'مسحوب', expired: 'منتهي'
    };
    return labels[status] ?? status;
  }
}
