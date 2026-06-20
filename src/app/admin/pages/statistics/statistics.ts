import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Auth } from '../../../services/auth';

interface StatCard {
  label: string;
  value: string;
  change: string;
  icon: string;
  iconBg: string;
  iconColor: string;
}

interface CategoryShare {
  name: string;
  percent: number;
}

interface MonthlyRevenue {
  month: string;
  value: number;
}

@Component({
  selector: 'app-admin-statistics',
  imports: [CommonModule],
  templateUrl: './statistics.html',
  styleUrl: './statistics.css',
})
export class AdminStatistics implements OnInit {
  private apiUrl = 'https://sala7ly.runasp.net/api';

  loading = true;
  errorMsg = '';

  statCards: StatCard[] = [];
  categories: CategoryShare[] = [];
  monthlyRevenue: MonthlyRevenue[] = [];

  constructor(private http: HttpClient, private authService: Auth) {}

  ngOnInit() {
    this.loadStatistics();
  }

  private authHeaders(): HttpHeaders {
    let token = this.authService.getToken() || '';
    if (token.startsWith('Bearer ')) token = token.substring(7);
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  loadStatistics() {
    this.loading = true;
    this.errorMsg = '';

    this.http.get(`${this.apiUrl}/Admin/statistics`, { headers: this.authHeaders() }).subscribe({
      next: (data: any) => {
        this.mapStatistics(data);
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        if (err.status === 404) {
          this.errorMsg = 'لم يتم إنشاء نقطة الإحصائيات بعد على السيرفر';
        } else if (err.status === 401 || err.status === 403) {
          this.errorMsg = 'غير مصرح لك بالوصول لهذه البيانات';
        } else {
          this.errorMsg = 'تعذّر تحميل الإحصائيات';
        }
      }
    });
  }

  private mapStatistics(data: any) {
    this.statCards = [
      {
        label: 'معدل الإكمال',
        value: `${data.completionRate ?? 0}%`,
        change: this.formatChange(data.completionRateChange),
        icon: 'fa-solid fa-arrow-trend-up',
        iconBg: '#e8f4ff',
        iconColor: '#1787e0',
      },
      {
        label: 'طلبات جديدة',
        value: `${data.newRequests ?? 0}`,
        change: this.formatChange(data.newRequestsChange),
        icon: 'fa-regular fa-clipboard',
        iconBg: '#e8f4ff',
        iconColor: '#1787e0',
      },
      {
        label: 'مستخدمون جدد',
        value: `${data.newUsers ?? 0}`,
        change: this.formatChange(data.newUsersChange),
        icon: 'fa-solid fa-users',
        iconBg: '#e8f4ff',
        iconColor: '#1787e0',
      },
      {
        label: 'إيرادات الشهر',
        value: `${data.monthlyRevenueTotal ?? 0} ج`,
        change: this.formatChange(data.monthlyRevenueChange),
        icon: 'fa-solid fa-dollar-sign',
        iconBg: '#e8f4ff',
        iconColor: '#1787e0',
      },
    ];

    this.categories = (data.categoryDistribution || []).map((c: any) => ({
      name: c.name,
      percent: c.percent,
    }));

    this.monthlyRevenue = (data.monthlyRevenueChart || []).map((m: any) => ({
      month: m.month,
      value: m.value,
    }));
  }

  private formatChange(value: number | undefined): string {
    if (value === undefined || value === null) return '';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value}%`;
  }

  get maxRevenue(): number {
    if (this.monthlyRevenue.length === 0) return 1;
    return Math.max(...this.monthlyRevenue.map(m => m.value));
  }

  barHeight(value: number): number {
    if (this.maxRevenue === 0) return 0;
    return Math.round((value / this.maxRevenue) * 100);
  }

  
}