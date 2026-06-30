import { Component, effect, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification-service';

@Component({
  selector: 'app-notification-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-toast.html'
})
export class NotificationToast {
  private notificationService = inject(NotificationService);

  visible = signal(false);
  current = this.notificationService.latestNotification;

  constructor() {
    effect(() => {
      const n = this.current();
      if (n) {
        this.visible.set(true);
        setTimeout(() => this.visible.set(false), 5000);
      }
    });
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
      case 'verification':  return 'fa-solid fa-clipboard-check';
      default:              return 'fa-regular fa-bell';
    }
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

  // green border if money received, red if deducted, otherwise the type's icon color
  borderColor(n: any): string {
    if (n.type === 'payment') {
      const incoming = n.title?.includes('إضافة') || n.title?.includes('شحن');
      return incoming ? '#2e7d32' : '#dc3545';
    }
    return this.iconColor(n.type);
  }

  close(): void {
    this.visible.set(false);
  }
}