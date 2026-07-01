import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

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
  styleUrl: `./dashboard.css`
})
export class Dashboard {
  technicianName = '';

  // stats
  completionRate = 98;
  averageRating = 4.9;
  monthlyEarnings = 4250;
  activeTasksCount = 4;

  // reviews
  recentReviews: Review[] = [
    {
      customerName: 'السيدة منى',
      rating: 5,
      comment: 'ممتاز جداً وسرعة في الإنجاز',
    },
    {
      customerName: 'أحمد محمود',
      rating: 5,
      comment: 'خدمة رائعة وأسعار مناسبة',
    },
    {
      customerName: 'كريم حسن',
      rating: 5,
      comment: 'محترف ومهذب',
    },
  ];

  // today schedule
  todaySchedule: ScheduleTask[] = [
    {
      id: 1,
      time: '١٠:٠٠',
      title: 'صيانة تكييف',
      customerName: 'السيدة منى',
      address: 'مدينة نصر',
      statusLabel: 'قادم',
      statusClass: 'status-upcoming',
    },
    {
      id: 2,
      time: '١٢:٣٠',
      title: 'إصلاح مكيف',
      customerName: 'أحمد إبراهيم',
      address: 'الزمالك',
      statusLabel: 'قادم',
      statusClass: 'status-upcoming',
    },
    {
      id: 3,
      time: '١٠:٠٠',
      title: 'تركيب تكييف جديد',
      customerName: 'كريم سعيد',
      address: 'المعادي',
      statusLabel: 'مؤكد',
      statusClass: 'status-confirmed',
    },
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    const name = localStorage.getItem('userName') ?? 'فني';
    this.technicianName = name;
  }

  goToDetails(taskId: number): void {
    this.router.navigate(['/technician/task-details', taskId]);
  }

  goToChat(taskId: number): void {
    this.router.navigate(['/technician/chat', taskId]);
  }
}





