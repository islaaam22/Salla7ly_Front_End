import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-customer-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './customer-sidebar.html',
  styleUrl: './customer-sidebar.css',
})
export class CustomerSidebar implements OnInit {
  userName = '';
  userInitial = '?';

  navItems = [
  { label: 'لوحة التحكم', icon: 'fa-solid fa-table-cells-large', link: '#' },
  { label: 'الملف الشخصي', icon: 'fa-regular fa-user', link: '/customer/profile' },
  { label: 'طلب جديد', icon: 'fa-regular fa-clipboard', link: '/customer/new-request' },
  { label: 'طلباتي', icon: 'fa-solid fa-briefcase', link: '/customer/my-requests' },
  { label: 'العروض المستلمة', icon: 'fa-solid fa-cart-arrow-down', link: '/customer/received-bids' },
  { label: 'المحفظة', icon: 'fa-solid fa-wallet', link: '/wallet' },
  { label: 'الإشعارات', icon: 'fa-regular fa-bell', link: '/customer/notifications' },
  { label: 'المحادثات', icon: 'fa-regular fa-message', link: '/customer/chat' },
];

  constructor(
    private authService: Auth,
    private router: Router,
  ) {}

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
