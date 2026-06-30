import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification-service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.html'
})
export class Notifications implements OnInit {
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  notifications = this.notificationService.notifications;
  unreadCount = this.notificationService.unreadCount;

  ngOnInit(): void {
    this.notificationService.loadNotifications();
    this.notificationService.startConnection();
  }

  iconFor(type: string): string {
    switch (type) {
      case 'new_bid':       return 'fa-solid fa-coins';
      case 'bid_accepted':  return 'fa-solid fa-circle-check';
      case 'payment':       return 'fa-solid fa-credit-card';
      case 'chat':          return 'fa-regular fa-message';
      case 'escrow':        return 'fa-solid fa-shield-halved';
      case 'emergency':     return 'fa-solid fa-triangle-exclamation';
      case 'promo':         return 'fa-solid fa-gift';
      case 'system':        return 'fa-solid fa-gear';
      case 'verification':  return 'fa-solid fa-id-card';
      default:              return 'fa-regular fa-bell';
    }
  }
markAllRead(): void {
  this.notificationService.markAllAsRead();
}
  bubbleBg(type: string): string {
    switch (type) {
      case 'bid_accepted': return '#e8f5e9';
      case 'payment':      return '#e7f1ff';
      case 'new_bid':      return '#e7f1ff';
      case 'emergency':    return '#fdeaea';
      case 'verification': return '#fff4e0';
      default:             return '#f1f3f5';
    }
  }

  iconColor(type: string): string {
    switch (type) {
      case 'bid_accepted': return '#2e7d32';
      case 'payment':      return '#0d6efd';
      case 'new_bid':      return '#0d6efd';
      case 'emergency':    return '#dc3545';
      case 'verification': return '#b8860b';
      default:             return '#6c757d';
    }
  }

  onClick(n: any): void {
    if (!n.isRead) this.notificationService.markAsRead(n.id);

    const route = this.routeFor(n.type);
    if (route) this.router.navigate([route]);
  }

  private routeFor(type: string): string | null {
    const role = localStorage.getItem('role');

    switch (type) {
      case 'verification':
        return role === 'Admin' ? '/admin/technicians' : '/technician/verification';
      case 'new_bid':       return '/customer/received-bids';
      case 'bid_accepted':  return '/technician/assigned-tasks';
      case 'chat':          return '/customer/chat';
      case 'payment':       return '/wallet';
      default:              return null;
    }
  }
}