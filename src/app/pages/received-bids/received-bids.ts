import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { BidApiService } from '../../services/bid-api';
import { BiddingSignalRService } from '../../services/bidding-signalr';
import { Bid } from '../../models/bid-models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-received-bids',
  imports: [CommonModule, FormsModule],
  templateUrl: './received-bids.html',
  styleUrl: './received-bids.css',
})
export class ReceivedBids implements OnInit, OnDestroy{
 requestId!: number;
  bids: Bid[] = [];
  bidCount = 0;
  private subs = new Subscription();

  constructor(
    private bidApi: BidApiService,
    private biddingHub: BiddingSignalRService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.requestId = Number(this.route.snapshot.paramMap.get('requestId'));
    const token = localStorage.getItem('token')!;

    if (!this.biddingHub.isConnected) {
      await this.biddingHub.connect(token);
    }

    // Load existing bids via REST
    this.bidApi.getBidsByRequest(this.requestId).subscribe(res => {
      if (res.success && res.data) this.bids = res.data;
    });

    // Join the SignalR room for this request
    await this.biddingHub.joinRequest(this.requestId);

    // Listen for new bids in real-time
    this.subs.add(
      this.biddingHub.newBidReceived$.subscribe(bid => {
        if (bid.serviceRequestId === this.requestId) {
          this.bids = [...this.bids, bid];
        }
      })
    );

    this.subs.add(
      this.biddingHub.bidCountUpdated$.subscribe(data => {
        if (data.requestId === this.requestId) {
          this.bidCount = data.count;
        }
      })
    );

    this.subs.add(
      this.biddingHub.bidWithdrawn$.subscribe(data => {
        this.bids = this.bids.filter(b => b.id !== data.bidId);
      })
    );
  }

  acceptBid(bidId: number) {
    this.bidApi.acceptBid(bidId).subscribe({
      next: () => {
        // Mark accepted bid, remove rejected ones from view
        this.bids = this.bids.map(b =>
          b.id === bidId ? { ...b, status: 'accepted' } : { ...b, status: 'rejected' }
        );
      },
      error: (err) => console.error('Accept failed:', err)
    });
  }

  rejectBid(bidId: number) {
    this.bidApi.rejectBid(bidId).subscribe({
      next: () => {
        this.bids = this.bids.map(b =>
          b.id === bidId ? { ...b, status: 'rejected' } : b
        );
      },
      error: (err) => console.error('Reject failed:', err)
    });
  }

  async ngOnDestroy() {
    await this.biddingHub.leaveRequest(this.requestId);
    this.subs.unsubscribe();
  }
}
