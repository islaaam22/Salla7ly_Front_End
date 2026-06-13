import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './customer-sidebar.html'
})
export class Sidebar {
  // nav items: only the profile has a real route; the rest are placeholders
  navItems = [
    { label: 'لوحة التحكم',      icon: '▦',  link: '#' },
    { label: 'طلب جديد',         icon: '＋', link: '#' },
    { label: 'طلباتي',           icon: '☰',  link: '#' },
    { label: 'العروض المستلمة',  icon: '✎',  link: '#' },
    { label: 'المحفظة',          icon: '▭',  link: '#' },
    { label: 'الإشعارات',        icon: '🔔', link: '#' },
    { label: 'المحادثات',        icon: '💬', link: '#' },
    { label: 'إعدادات الملف',    icon: '👥', link: '#' }
  ];
}