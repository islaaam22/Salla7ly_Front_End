import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-technician-layout',
  imports: [CommonModule, RouterOutlet, RouterLinkActive, RouterLink],
  templateUrl: './technician-layout.html',
  styleUrl: './technician-layout.css',
})
export class TechnicianLayout implements OnInit {
  technicianName = '';
  avatarLetter = '';

  navItems = [
    { label: 'لوحة التحكم', icon: 'fa-solid fa-table-cells-large', route: '/technician/dashboard' },
    { label: 'طلبات متاحة', icon: 'fa-regular fa-clipboard', route: '/technician/available-requests' },
    { label: 'المهام الموكلة', icon: 'fa-solid fa-briefcase', route: '/technician/assigned-tasks' },
    { label: 'الأرباح', icon: 'fa-solid fa-dollar-sign', route: '/technician/earnings' },
    { label: 'أعمالي السابقة', icon: 'fa-regular fa-image', route: '/technician/previous-works' },
    { label: 'التوثيق', icon: 'fa-regular fa-shield', route: '/technician/verification' },
    { label: 'الإشعارات', icon: 'fa-regular fa-bell', route: '/technician/notifications' },
    { label: 'المحادثات', icon: 'fa-regular fa-message', route: '/technician/chat' },
    { label: 'الملف الشخصي', icon: 'fa-regular fa-user', route: '/technician/profile' },
  ];

  constructor(
    private router: Router,
    private authService: Auth,
  ) {}

  ngOnInit() {
    const user = this.authService.getUser();
    this.technicianName = user?.userName || user?.email || 'الفني';
    this.avatarLetter = this.technicianName.charAt(0).toUpperCase();
  }

 logout() {
    this.authService.logout();
    localStorage.removeItem('user');
    // NOTE: verification_status is kept intentionally so the pending screen
    // shows correctly after re-login without needing the API to respond
    this.router.navigate(['/login']);
  }
}

