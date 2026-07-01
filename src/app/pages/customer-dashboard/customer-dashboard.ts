import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

interface ActiveRequest {
  id: number;
  title: string;
  technicianName: string | null;
  status: string;
}

interface ActivityItem {
  title: string;
  time: string;
  icon: string;
  iconBg: string;
  iconColor: string;
}
@Component({
  selector: 'app-customer-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './customer-dashboard.html',
  styleUrl: `./customer-dashboard.css`
})
export class CustomerDashboard implements OnInit{
userName = '';

  // stats
  activeRequestsCount = 2;
  completedRequestsCount = 14;
  walletBalance = 450;
  newNotificationsCount = 3;

  // active requests
  activeRequests: ActiveRequest[] = [
    {
      id: 1,
      title: 'صيانة تكييف غرفة المعيشة',
      technicianName: 'أحمد فاروق',
      status: 'inProgress',
    },
    {
      id: 2,
      title: 'إصلاح تسريب مياه المطبخ',
      technicianName: 'محمد سعيد',
      status: 'onTheWay',
    },
  ];

  // recent activity
  recentActivity: ActivityItem[] = [
    {
      title: 'اكتمل طلب صيانة الغسالة',
      time: 'منذ ساعتين',
      icon: 'fa-solid fa-circle-check',
      iconBg: '#e1f5ee',
      iconColor: '#10b981',
    },
    {
      title: 'قمت بتقييم م. علي حسن بـ 5 نجوم',
      time: 'أمس',
      icon: 'fa-solid fa-star',
      iconBg: '#fefce8',
      iconColor: '#f59e0b',
    },
    {
      title: 'تم شحن محفظتك بـ 200 ج',
      time: 'منذ 3 أيام',
      icon: 'fa-solid fa-wallet',
      iconBg: '#e8f3ff',
      iconColor: '#1787e0',
    },
  ];

  ngOnInit(): void {
    const name = localStorage.getItem('userName') ?? 'عميل';
    this.userName = name;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      open: 'badge-open',
      inProgress: 'badge-progress',
      onTheWay: 'badge-confirmed',
      completed: 'badge-done',
    };
    return map[status] ?? 'badge-open';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      open: 'مفتوح',
      inProgress: 'قيد التنفيذ',
      onTheWay: 'في الطريق',
      completed: 'مكتمل',
    };
    return map[status] ?? status;
  }
}





