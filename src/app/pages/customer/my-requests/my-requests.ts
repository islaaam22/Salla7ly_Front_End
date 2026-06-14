import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RequestService } from '../../../services/request';

@Component({
  selector: 'app-my-requests',
  imports: [CommonModule],
  templateUrl: './my-requests.html',
  styleUrl: './my-requests.css'
})
export class MyRequests implements OnInit {
  requests: any[] = [];
  loading = true;

  constructor(private requestService: RequestService, private router: Router) {}

  ngOnInit() {
    this.requestService.getMyRequests().subscribe({
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
    case 'open': return 'مفتوح';
    case 'inprogress': return 'قيد التنفيذ';
    case 'completed': return 'مكتمل';
    case 'cancelled': return 'ملغي';
    default: return status ?? 'غير معروف';
  }
}

getStatusClass(status: any): string {
  switch (status?.toLowerCase()) {
    case 'open': return 'badge-open';
    case 'inprogress': return 'badge-progress';
    case 'completed': return 'badge-done';
    case 'cancelled': return 'badge-cancelled';
    default: return '';
  }
}

  goToNewRequest() {
    this.router.navigate(['/customer/new-request']);
  }

  goToOffers(requestId: number) {
    this.router.navigate(['/customer/offers', requestId]);
  }

  goToReview(requestId: number) {
    this.router.navigate(['/customer/review', requestId]);
  }

  goToChat(requestId: number) {
    this.router.navigate(['/customer/chat', requestId]);
  }
}
