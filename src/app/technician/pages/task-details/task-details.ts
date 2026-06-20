import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RequestService } from '../../../services/request';

@Component({
  selector: 'app-task-details',
  imports: [CommonModule, RouterLink],
  templateUrl: './task-details.html',
  styleUrl: './task-details.css'
})
export class TaskDetailsComponent implements OnInit {
  request: any = null;
  loading = true;
  completing = false;
  successMsg = '';
  errorMsg = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private requestService: RequestService
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

  getStatusLabel(status: any): string {
    switch (status?.toLowerCase()) {
      case 'open': return 'قادم';
      case 'inprogress': return 'قيد التنفيذ';
      case 'completed': return 'مكتمل';
      case 'confirmed': return 'مؤكد';
      default: return status ?? 'غير معروف';
    }
  }

  getStatusClass(status: any): string {
    switch (status?.toLowerCase()) {
      case 'open': return 'badge-open';
      case 'inprogress': return 'badge-progress';
      case 'completed': return 'badge-done';
      case 'confirmed': return 'badge-confirmed';
      default: return '';
    }
  }

  completeRequest() {
    if (!this.request?.id) return;
    this.completing = true;
    this.requestService.completeRequest(this.request.id).subscribe({
      next: () => {
        this.completing = false;
        this.successMsg = 'تم إنهاء المهمة بنجاح!';
        setTimeout(() => this.router.navigate(['/technician/assigned-tasks']), 1500);
      },
      error: () => {
        this.completing = false;
        this.errorMsg = 'حدث خطأ، يرجى المحاولة مرة أخرى';
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
