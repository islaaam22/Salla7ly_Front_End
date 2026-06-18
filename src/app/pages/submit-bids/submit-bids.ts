import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { BidApiService } from '../../services/bid-api';
import { BiddingSignalRService } from '../../services/bidding-signalr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-submit-bids',
  imports: [CommonModule, FormsModule],
  templateUrl: './submit-bids.html',
  styleUrl: './submit-bids.css',
})
export class SubmitBids implements OnInit, OnDestroy{
   requestId!: number;
  price = 0;
  proposalMessage = '';
  estimatedDurationMinutes = 60;
  myBidId: number | null = null;
  isSubmitting = false;
  private subs = new Subscription();

  constructor(
    private bidApi: BidApiService,
    private biddingHub: BiddingSignalRService
  ) {}

  async ngOnInit() {
    const token = localStorage.getItem('token')!;
    if (!this.biddingHub.isConnected) {
      await this.biddingHub.connect(token);
    }

    // Listen for accept/reject on bids I submitted
    this.subs.add(
      this.biddingHub.bidAccepted$.subscribe(data => {
        if (data.bidId === this.myBidId) {
          alert('تم قبول عرضك! 🎉');
        }
      })
    );

    this.subs.add(
      this.biddingHub.bidRejected$.subscribe(data => {
        if (data.bidId === this.myBidId) {
          alert('تم رفض عرضك.');
        }
      })
    );
  }

  submitBid() {
    this.isSubmitting = true;
    this.bidApi.submitBid(this.requestId, {
      price: this.price,
      proposalMessage: this.proposalMessage,
      estimatedDurationMinutes: this.estimatedDurationMinutes
    }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.myBidId = res.data.id;
        }
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Submit failed:', err);
        this.isSubmitting = false;
      }
    });
  }

  withdrawBid() {
    if (!this.myBidId) return;
    this.bidApi.withdrawBid(this.myBidId).subscribe({
      next: () => { this.myBidId = null; },
      error: (err) => console.error('Withdraw failed:', err)
    });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
