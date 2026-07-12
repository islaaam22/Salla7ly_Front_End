import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { NotificationService } from '../../../services/notification-service';

interface Review {
  customerName: string;
  rating: number;
  comment: string;
}
interface ScheduleTask {
  id: number;
  time: string;
  title: string;
  customerName: string;
  address: string;
  statusLabel: string;
  statusClass: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private apiBase = 'https://sala7ly.runasp.net';

  technicianName = '';

  // stats (all real)
  walletBalance = 0;
  totalEarned = 0;
  averageRating = 0;
  activeTasksCount = 0;
  completedCount = 0;

  // notifications come straight from the shared signal
  unreadCount = this.notificationService.unreadCount;

  recentReviews: Review[] = [];
  todaySchedule: ScheduleTask[] = [];

  ngOnInit(): void {
    this.technicianName = localStorage.getItem('userName') ?? 'فني';
    const userId = localStorage.getItem('userId');

    this.loadWallet();
    this.loadReviews(userId);
    this.loadTasks();
  }

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // ── Wallet (balance + earnings) ──
  private loadWallet(): void {
    this.http
      .get<any>(`${this.apiBase}/api/wallet?page=1&pageSize=1`, { headers: this.authHeaders() })
      .subscribe({
        next: (res) => {
          this.walletBalance = res?.data?.balance ?? 0;
          this.totalEarned = res?.data?.totalEarned ?? 0;
        },
        error: () => {},
      });
  }

  // ── Reviews + average rating ──
  private loadReviews(userId: string | null): void {
    if (!userId) return;

    this.http
      .get<any[]>(`${this.apiBase}/api/Review/technician/${userId}`)
      .subscribe({
        next: (reviews) => {
          this.recentReviews = reviews.slice(0, 3).map((r) => ({
            customerName: r.reviewerName ?? 'عميل',
            rating: Math.round(r.overallScore),
            comment: r.comment ?? '',
          }));

          if (reviews.length > 0) {
            const sum = reviews.reduce((acc, r) => acc + (r.overallScore ?? 0), 0);
            this.averageRating = Math.round((sum / reviews.length) * 10) / 10;
          }
        },
        error: () => {},
      });
  }

  // ── Tasks (active count, completed count, today's schedule) ──
  private loadTasks(): void {
    this.http
      .get<any[]>(`${this.apiBase}/api/requests/assigned`, { headers: this.authHeaders() })
      .subscribe({
        next: (tasks) => {
          this.activeTasksCount = tasks.filter(
            (t) => t.status === 'assigned' || t.status === 'in_progress',
          ).length;

          this.completedCount = tasks.filter((t) => t.status === 'completed').length;

          const today = new Date().toDateString();
          this.todaySchedule = tasks
            .filter((t) => new Date(t.scheduledAt).toDateString() === today)
            .map((t) => ({
              id: t.id,
              time: new Date(t.scheduledAt).toLocaleTimeString('ar-EG', {
                hour: '2-digit',
                minute: '2-digit',
              }),
              title: t.title,
              customerName: t.customerName ?? '',
              address: t.address ?? '',
              statusLabel: t.status === 'in_progress' ? 'جاري' : 'قادم',
              statusClass: t.status === 'in_progress' ? 'status-confirmed' : 'status-upcoming',
            }));
        },
        error: () => {},
      });
  }

  goToDetails(taskId: number): void {
    this.router.navigate(['/technician/task-details', taskId]);
  }

  goToChat(taskId: number): void {
    this.router.navigate(['/technician/chat', taskId]);
  }
}