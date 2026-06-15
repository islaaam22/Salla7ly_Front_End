
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-customer-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './customer-sidebar.html'
})
export class CustomerSidebar implements OnInit {
  userName = '';
  userInitial = '?';

  navItems = [
    { label: 'لوحة التحكم',     icon: '▦',  link: '/customer/profile' },
    { label: 'طلب جديد',        icon: '＋', link: '/customer/new-request' },
    { label: 'طلباتي',          icon: '☰',  link: '/customer/my-requests' },
    { label: 'العروض المستلمة', icon: '✎',  link: '#' },
    { label: 'المحفظة',         icon: '▭',  link: '#' },
    { label: 'الإشعارات',       icon: '🔔', link: '#' },
    { label: 'المحادثات',       icon: '💬', link: '/customer/chat' },
    { label: 'الملف الشخصي',   icon: '👤', link: '/customer/profile' },
    { label: 'الإعدادات',       icon: '⚙',  link: '#' }
  ];

  constructor(private authService: Auth, private router: Router) {}

  ngOnInit(): void {
    const name = localStorage.getItem('userName') ?? 'مستخدم';
    this.userName = name;
    this.userInitial = name.charAt(0)?.toUpperCase() ?? '?';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
