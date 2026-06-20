import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  imports: [CommonModule, FormsModule]
})
export class BidComparisonComponent implements OnInit, OnDestroy {
  requestId!: number;
  bids: Bid[] = [];
  isLoading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
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
    console.log('Calling getBidsByRequest with:', this.requestId);
    this.requestService.getBidsByRequest(this.requestId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: bids => {
          console.log('Bids received:', bids);
          this.bids = bids;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false; }
      });
  }

  private listenToSignalR(): void {
    // عرض جديد يضاف فوراً
    this.signalR.newBidReceived$
      .pipe(takeUntil(this.destroy$))
      .subscribe(bid => {
        if (bid.serviceRequestId === this.requestId) {
          // تأكد مش موجود
          const exists = this.bids.some(b => b.id === bid.id);
          if (!exists) this.bids = [bid, ...this.bids];
        }
      });

    // لو عرض اتسحب
    this.signalR.bidWithdrawn$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ bidId }) => {
        this.bids = this.bids.filter(b => b.id !== bidId);
      });

    // لو عرض اتقبل
    this.signalR.bidAccepted$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ bidId }) => {
        this.bids = this.bids.map(b =>
          b.id === bidId ? { ...b, status: 'accepted' } : { ...b, status: 'rejected' }
        );
      });
  }

  acceptBid(bidId: number): void {
    this.requestService.acceptBid(bidId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.bids = this.bids.map(b =>
            b.id === bidId ? { ...b, status: 'accepted' } : { ...b, status: 'rejected' }
          );
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
