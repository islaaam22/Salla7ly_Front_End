import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RequestService } from '../../../services/request';
import { PaymentService } from '../../../services/payment-service';

@Component({
  selector: 'app-my-requests',
  imports: [CommonModule],
  templateUrl: './my-requests.html',
  styleUrl: './my-requests.css'
})
export class MyRequests implements OnInit {
  requests: any[] = [];
  loading = true;
  completingId: number | null = null;
  errorMsg: string | null = null;

  constructor(
    private requestService: RequestService,
    private paymentService: PaymentService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadRequests();
  }

  private loadRequests() {
    this.loading = true;
    this.requestService.getMyRequests().subscribe({
      next: (res) => {
        this.requests = res;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  /** Normalize backend status string: strip underscores, lowercase */
  private normalizeStatus(status: any): string {
    return (status ?? '').toLowerCase().replace(/_/g, '');
  }

  getStatusLabel(status: any): string {
    switch (this.normalizeStatus(status)) {
      case 'open':        return 'مفتوح';
      case 'assigned':    return 'تم اختيار الفني';
      case 'inprogress':  return 'قيد التنفيذ';
      case 'completed':   return 'مكتمل';
      case 'cancelled':   return 'ملغي';
      default:            return status ?? 'غير معروف';
    }
  }

  getStatusClass(status: any): string {
    switch (this.normalizeStatus(status)) {
      case 'open':        return 'badge-open';
      case 'assigned':    return 'badge-assigned';
      case 'inprogress':  return 'badge-progress';
      case 'completed':   return 'badge-done';
      case 'cancelled':   return 'badge-cancelled';
      default:            return '';
    }
  }

  /** open requests → show "View Details" (go to bids for THIS request) */
  isOpen(status: any): boolean {
    return this.normalizeStatus(status) === 'open';
  }

  /** assigned / inprogress → show "Complete Service" (calls API then review) */
  needsCompletion(status: any): boolean {
    const s = this.normalizeStatus(status);
    return s === 'assigned' || s === 'inprogress';
  }

  /** completed → show "Rate Service" (go straight to review, no API) */
  isCompleted(status: any): boolean {
    return this.normalizeStatus(status) === 'completed';
  }

  /** "View Details" on open requests → submit-bid page for this specific request */
  goToBids(requestId: number) {
    this.router.navigate(['/customer/submit-bid', requestId]);
  }

  /** "Complete Service" on assigned/inprogress → create payment first, then complete */
  completeService(requestId: number) {
    this.completingId = requestId;
    this.errorMsg = null;

    // First, check if payment already exists, if not create it
    this.paymentService.getEscrow(requestId).subscribe({
      next: (escrowRes) => {
        if (escrowRes.success && escrowRes.data) {
          // Payment already exists, just complete the request
          this.finalizeCompletion(requestId);
        } else {
          // No payment exists, create it first
          this.paymentService.createEscrow(requestId).subscribe({
            next: () => {
              // Payment created successfully, now complete the request
              this.finalizeCompletion(requestId);
            },
            error: () => {
              this.completingId = null;
              this.errorMsg = 'فشل إنشاء الدفع المؤجل. يرجى المحاولة لاحقًا.';
            }
          });
        }
      },
      error: () => {
        // Assume no payment exists if get fails, try to create
        this.paymentService.createEscrow(requestId).subscribe({
          next: () => {
            this.finalizeCompletion(requestId);
          },
          error: () => {
            this.completingId = null;
            this.errorMsg = 'فشل إنشاء الدفع المؤجل. يرجى المحاولة لاحقًا.';
          }
        });
      }
    });
  }

  /** Final step: mark request as completed and navigate to review */
  finalizeCompletion(requestId: number) {
    this.requestService.completeRequest(requestId).subscribe({
      next: () => {
        this.completingId = null;
        const req = this.requests.find(r => r.id === requestId);
        if (req) req.status = 'completed';
        this.router.navigate(['/customer/review', requestId]);
      },
      error: () => {
        this.completingId = null;
        this.errorMsg = 'فشل إتمام الطلب. يرجى المحاولة مرة أخرى.';
      }
    });
  }

  /** "Rate Service" on completed → go straight to review page */
  goToReview(requestId: number) {
    this.router.navigate(['/customer/review', requestId]);
  }

  goToNewRequest() {
    this.router.navigate(['/customer/new-request']);
  }

  goToChat(requestId: number) {
    this.router.navigate(['/customer/chat', requestId]);
  }
}
