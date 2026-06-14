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
    { label: 'لوحة التحكم',      icon: '▦',  link: '#' },
    { label: 'طلب جديد',         icon: '＋', link: '#' },
    { label: 'طلباتي',           icon: '☰',  link: '#' },
    { label: 'العروض المستلمة',  icon: '✎',  link: '#' },
    { label: 'المحفظة',          icon: '▭',  link: '#' },
    { label: 'الإشعارات',        icon: '🔔', link: '#' },
    { label: 'المحادثات',        icon: '💬', link: '#' },
    { label: 'الملف الشخصي',     icon: '👤', link: '/customer/profile' },
    { label: 'الإعدادات',        icon: '⚙',  link: '#' }
  ];

  constructor(private authService: Auth, private router: Router) {}

  ngOnInit(): void {
    // pull the logged-in user's name from storage (adjust if you store it differently)
    const name = localStorage.getItem('name') ?? 'مستخدم';
    this.userName = name;
    this.userInitial = name.charAt(0)?.toUpperCase() ?? '?';
  }

  logout(): void {
    this.authService.logout();          // clears token/role/refreshToken
    this.router.navigate(['/login']);   // back to login
  }
}