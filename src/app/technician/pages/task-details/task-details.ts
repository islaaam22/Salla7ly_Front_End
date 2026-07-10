import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RequestService } from '../../../services/request';
import { PaymentService } from '../../../services/payment-service';

@Component({
  selector: 'app-task-details',
  imports: [CommonModule],
  templateUrl: './task-details.html',
  styleUrl: './task-details.css'
})
export class TaskDetailsComponent implements OnInit {
  request: any = null;
  loading = true;
  starting = false;
  releasing = false;
  successMsg = '';
  errorMsg = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private requestService: RequestService,
    private paymentService: PaymentService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.requestService.getRequestById(id).subscribe({
      next: (res) => {
        this.request = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  /** Normalize backend status string: strip underscores, lowercase */
  private normalizeStatus(status: any): string {
    return (status ?? '').toLowerCase().replace(/_/g, '');
  }

  getStatusLabel(status: any): string {
    switch (this.normalizeStatus(status)) {
      case 'open':        return 'قادم';
      case 'assigned':    return 'مسند';
      case 'inprogress':  return 'قيد التنفيذ';
      case 'completed':   return 'مكتمل';
      case 'confirmed':   return 'مؤكد';
      default:            return status ?? 'غير معروف';
    }
  }

  getStatusClass(status: any): string {
    switch (this.normalizeStatus(status)) {
      case 'open':        return 'badge-open';
      case 'assigned':    return 'badge-confirmed';
      case 'inprogress':  return 'badge-progress';
      case 'completed':   return 'badge-done';
      case 'confirmed':   return 'badge-confirmed';
      default:            return '';
    }
  }

  startTask() {
    if (!this.request?.id || this.starting) return;
    this.starting = true;
    this.successMsg = '';
    this.errorMsg = '';

    this.requestService.startRequest(this.request.id).subscribe({
      next: () => {
        this.starting = false;
        this.successMsg = 'تم بدء المهمة بنجاح!';
        // Use the exact casing the backend will return on next fetch.
        // We store 'in_progress' to match backend; normalizeStatus handles display.
        this.request = { ...this.request, status: 'in_progress' };
        setTimeout(() => {
          this.router.navigate(['/technician/assigned-tasks']);
        }, 1500);
      },
      error: (err) => {
        this.starting = false;
        this.errorMsg =
          err?.error?.message ??
          err?.error?.title ??
          'حدث خطأ، يرجى المحاولة مرة أخرى';
      }
    });
  }

  isAlreadyStarted(): boolean {
    const s = this.normalizeStatus(this.request?.status);
    return s === 'inprogress' || s === 'completed';
  }

  releasePayment() {
    if (!this.request?.id || this.releasing) return;
    this.releasing = true;
    this.successMsg = '';
    this.errorMsg = '';

    this.paymentService.releasePayment(this.request.id).subscribe({
      next: () => {
        this.releasing = false;
        this.successMsg = 'تم تحرير المبلغ بنجاح إلى المحفظة الخاصة بالفني';
        this.request = { ...this.request, status: 'completed' };
      },
      error: (err) => {
        this.releasing = false;
        this.errorMsg = err?.error?.message ?? 'تعذر تحرير الدفع';
      }
    });
  }

  goToChat() {
    this.router.navigate(['/technician/chat', this.request.id]);
  }

  goBack() {
    this.router.navigate(['/technician/assigned-tasks']);
  }
}
