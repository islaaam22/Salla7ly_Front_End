import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BiddingSignalRService } from '../../services/bidding-signalr';
import { RequestService } from '../../services/bid-api';
import { Bid } from '../../models/bid-models';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bid-comparison',
  templateUrl: './submit-bids.html',
  imports: [CommonModule, FormsModule, RouterLink]
})
export class BidComparisonComponent implements OnInit, OnDestroy {
  requestId!: number;
  bids: Bid[] = [];
  isLoading = true;
  acceptingBidId: number | null = null;
  acceptError: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private requestService: RequestService,
    private signalR: BiddingSignalRService
  ) {}

  ngOnInit(): void {
    this.requestId = +this.route.snapshot.paramMap.get('id')!;
    this.loadBids();
    this.listenToSignalR();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.signalR.leaveRequest(this.requestId);
  }

  private loadBids(): void {
    this.requestService.getBidsByRequest(this.requestId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: bids => {
          this.bids = bids;
          this.isLoading = false;
        },
        error: () => { this.isLoading = false; }
      });
  }

  private listenToSignalR(): void {
    this.signalR.newBidReceived$
      .pipe(takeUntil(this.destroy$))
      .subscribe(bid => {
        if (bid.serviceRequestId === this.requestId) {
          const exists = this.bids.some(b => b.id === bid.id);
          if (!exists) this.bids = [bid, ...this.bids];
        }
      });

    this.signalR.bidWithdrawn$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ bidId }) => {
        this.bids = this.bids.filter(b => b.id !== bidId);
      });

    // When a bid is accepted (via SignalR from another session or server push),
    // update the local list to reflect the change.
    this.signalR.bidAccepted$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ bidId }) => {
        this.bids = this.bids.map(b =>
          b.id === bidId ? { ...b, status: 'accepted' } : { ...b, status: 'rejected' }
        );
      });
  }

  /**
   * Accept a bid:
   * 1. Call PUT /api/bids/{bidId}/accept
   * 2. Update local bid statuses optimistically
   * 3. Navigate to My Requests so the customer sees the new "Complete Service" button
   *    (the backend will have changed the request status to 'assigned')
   */
  acceptBid(bidId: number): void {
    this.acceptingBidId = bidId;
    this.acceptError = null;

    this.requestService.acceptBid(bidId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.acceptingBidId = null;
          // Optimistically update local bid list
          this.bids = this.bids.map(b =>
            b.id === bidId ? { ...b, status: 'accepted' } : { ...b, status: 'rejected' }
          );
          // Navigate back so customer sees the updated request status ('assigned')
          // and the new "Complete Service" button
          setTimeout(() => {
            this.router.navigate(['/customer/my-requests']);
          }, 800); // brief delay so user sees the "accepted" banner
        },
        error: () => {
          this.acceptingBidId = null;
          this.acceptError = 'حدث خطأ أثناء قبول العرض. يرجى المحاولة مرة أخرى.';
        }
      });
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} دقيقة`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h} ساعة و ${m} دقيقة` : `${h} ساعة`;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'قيد المراجعة',
      accepted: 'مقبول',
      rejected: 'مرفوض',
      withdrawn: 'مسحوب',
      expired: 'منتهي'
    };
    return labels[status] ?? status;
  }
}
