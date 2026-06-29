import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RequestService } from '../../../services/request';

@Component({
  selector: 'app-assigned-tasks',
  imports: [CommonModule],
  templateUrl: './assigned-tasks.html',
  styleUrl: './assigned-tasks.css'
})
export class AssignedTasksComponent implements OnInit {
  requests: any[] = [];
  loading = true;
  errorMsg: string | null = null;

  constructor(private requestService: RequestService, private router: Router) {}

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.loading = true;
    this.errorMsg = null;
    this.requestService.getAssignedRequests().subscribe({
      next: (res) => {
        this.requests = res;
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'حدث خطأ أثناء تحميل المهام. يرجى المحاولة مرة أخرى.';
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
      case 'assigned':    return 'تم الإسناد';
      case 'inprogress':  return 'قيد التنفيذ';
      case 'completed':   return 'مكتمل';
      case 'open':        return 'مفتوح';
      default:            return status ?? 'غير معروف';
    }
  }

  getStatusClass(status: any): string {
    switch (this.normalizeStatus(status)) {
      case 'assigned':    return 'badge-assigned';
      case 'inprogress':  return 'badge-progress';
      case 'completed':   return 'badge-done';
      case 'open':        return 'badge-open';
      default:            return '';
    }
  }

  goToDetails(id: number) {
    this.router.navigate(['/technician/task-details', id]);
  }

  goToChat(id: number) {
    this.router.navigate(['/technician/chat', id]);
  }
}
