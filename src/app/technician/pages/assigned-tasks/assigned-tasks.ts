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

  constructor(private requestService: RequestService, private router: Router) {}

  ngOnInit() {
    this.requestService.getOpenRequests().subscribe({
      next: (res) => {
        this.requests = res;
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

  goToDetails(id: number) {
    this.router.navigate(['/technician/task-details', id]);
  }

  goToChat(id: number) {
    this.router.navigate(['/technician/chat', id]);
  }
}
