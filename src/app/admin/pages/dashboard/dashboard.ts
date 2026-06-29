import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Auth } from '../../../services/auth';

interface DashboardData {
  totalCustomers: number;
  totalTechnicians: number;
  activeRequests: number;
  monthlyRevenue: number;
  growthPercent: number;
  completedJobs: number;
}

interface DashboardResponse {
  success: boolean;
  message: string;
  data: DashboardData;
}

interface StatCard {
  title: string;
  key: keyof DashboardData;
  icon: string;
  color: string;
  value: number;
  prefix?: string;
  suffix?: string;
}

interface ManagementSection {
  title: string;
  description: string;
  icon: string;
  link: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private apiUrl = 'https://sala7ly.runasp.net/api';

  loading = true;
  errorMsg = '';
  dashboardData: DashboardData | null = null;
  adminName = '';

  stats: StatCard[] = [
    { 
      title: 'طلبات نشطة', 
      key: 'activeRequests',
      icon: 'fa-clipboard-list', 
      color: '#667eea',
      value: 0 
    },
    { 
      title: 'إجمالي الفنيين', 
      key: 'totalTechnicians',
      icon: 'fa-user-cog', 
      color: '#f6ad55',
      value: 0 
    },
    { 
      title: 'إجمالي العملاء', 
      key: 'totalCustomers',
      icon: 'fa-users', 
      color: '#4299e1',
      value: 0 
    },
    { 
      title: 'النمو', 
      key: 'growthPercent',
      icon: 'fa-chart-line', 
      color: '#48bb78',
      suffix: '%',
      value: 0 
    },
    { 
      title: 'إيرادات الشهر', 
      key: 'monthlyRevenue',
      icon: 'fa-dollar-sign', 
      color: '#ed8936',
      prefix: 'ج ',
      value: 0 
    },
    { 
      title: 'مهام مكتملة', 
      key: 'completedJobs',
      icon: 'fa-check-circle', 
      color: '#48bb78',
      value: 0 
    }
  ];

  managementSections: ManagementSection[] = [
    {
      title: 'إدارة الفنيين',
      description: 'قبول، تعليق، أو حذف حسابات الفنيين.',
      icon: 'fa-user-cog',
      link: '/admin/technicians',
      color: '#667eea'
    },
    {
      title: 'إدارة الطلبات',
      description: 'تابع جميع الطلبات النشطة والمكتملة عبر المنصة.',
      icon: 'fa-clipboard-list',
      link: '/admin/requests',
      color: '#4299e1'
    },
    {
      title: 'إدارة التقييمات',
      description: 'مراجعة وحذف التقييمات المخالفة.',
      icon: 'fa-star',
      link: '/admin/reviews',
      color: '#f6ad55'
    },
    {
      title: 'إدارة المحافظ',
      description: 'رصد المعاملات المالية وسحب الأرباح.',
      icon: 'fa-wallet',
      link: '/admin/wallets',
      color: '#48bb78'
    }
  ];

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: Auth
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private authHeaders(): HttpHeaders {
    let token = this.authService.getToken() || '';
    if (token.startsWith('Bearer ')) token = token.substring(7);
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  loadDashboardData(): void {
    this.loading = true;
    this.errorMsg = '';

    this.http.get<DashboardResponse>(`${this.apiUrl}/admin/dashboard`, { 
      headers: this.authHeaders() 
    }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.dashboardData = response.data;
          this.updateStatsValues();
        }
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        if (err.status === 401 || err.status === 403) {
          this.errorMsg = 'غير مصرح لك بالوصول لهذه البيانات';
        } else {
          this.errorMsg = 'تعذّر تحميل بيانات لوحة المشرف';
        }
        console.error('Dashboard error', err);
      }
    });
  }

  updateStatsValues(): void {
    if (!this.dashboardData) return;

    this.stats.forEach(stat => {
      stat.value = this.dashboardData![stat.key];
    });
  }

  navigateTo(link: string): void {
    this.router.navigate([link]);
  }

  refreshData(): void {
    this.loadDashboardData();
  }
}