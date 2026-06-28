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
      case 'new_bid': return '💰';
      case 'bid_accepted': return '✅';
      case 'chat': return '💬';
      case 'verification': return '📋';
      case 'payment': return '💳';
      case 'emergency': return '🚨';
      default: return '🔔';
    }
  }

  onClick(n: any): void {
    if (!n.isRead) this.notificationService.markAsRead(n.id);

    const route = this.routeFor(n.type);
    if (route) this.router.navigate([route]);
  }

  private routeFor(type: string): string | null {
    switch (type) {
      case 'verification':  return '/technician/verification';
      case 'new_bid':       return '/customer/received-bids';
      case 'bid_accepted':  return '/technician/assigned-tasks';
      case 'chat':          return '/customer/chat';
      default:              return null;   // system, etc. → just mark read, no navigation
    }
  }
}