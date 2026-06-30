import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './admin-sidebar.html',
  styleUrl: './admin-sidebar.css',
})
export class AdminSidebar {
  userName = localStorage.getItem('userName') ?? 'مشرف';
  userInitial = this.userName.charAt(0).toUpperCase();

  navItems = [
    { label: 'لوحة المشرف', icon: 'fa-solid fa-table-cells-large', link: '/admin/dashboard' },
    //{ label: 'الإحصائيات', icon: 'fa-solid fa-chart-line', link: '/admin/statistics' },
    { label: 'العملاء', icon: 'fa-regular fa-user', link: '/admin/customers' },
    { label: 'الفنيون', icon: 'fa-solid fa-helmet-safety', link: '/admin/technicians' },
    { label: 'الطلبات', icon: 'fa-regular fa-calendar', link: '/admin/requests' },
    { label: 'العروض', icon: 'fa-solid fa-tags', link: '/admin/Bids' },
    { label: 'الإشعارات', icon: 'fa-regular fa-bell', link: '/admin/notifications' },
    { label: 'المحافظ', icon: 'fa-solid fa-wallet', link: '/admin/wallets' },
    { label: 'التقييمات', icon: 'fa-regular fa-star', link: '/admin/reviews' },
    // { label: 'الإعدادات', icon: 'fa-solid fa-gear', link: '/admin/settings' },
  ];

  constructor(private router: Router) {}

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    this.router.navigate(['/login']);
  }
}
