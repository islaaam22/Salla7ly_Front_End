import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './customer-sidebar.html'
})
export class Sidebar {
  userName = localStorage.getItem('userName') ?? 'مستخدم';
  userInitial = this.userName.charAt(0).toUpperCase();

  navItems = [
    { label: 'لوحة التحكم',     icon: '▦',  link: '/customer/profile' },
    { label: 'طلب جديد',        icon: '＋', link: '/customer/new-request' },
    { label: 'طلباتي',          icon: '☰',  link: '/customer/my-requests' },
    { label: 'العروض المستلمة', icon: '✎',  link: '#' },
    { label: 'المحفظة',         icon: '▭',  link: '#' },
    { label: 'الإشعارات',       icon: '🔔', link: '#' },
    { label: 'المحادثات',       icon: '💬', link: '#' },
    { label: 'إعدادات الملف',   icon: '👥', link: '#' },
    { label: 'الملف الشخصي',   icon: '👤', link: '/customer/profile' },
    { label: 'الإعدادات',       icon: '⚙',  link: '#' },
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
