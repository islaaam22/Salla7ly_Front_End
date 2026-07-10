import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as signalR from '@microsoft/signalr';
import { AppNotification } from '../models/notification-model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private apiUrl = 'https://sala7ly.runasp.net/api/notifications';
  private hubUrl = 'https://sala7ly.runasp.net/notificationhub';
  private connection?: signalR.HubConnection;

  // signals so the UI updates reactively
  notifications = signal<AppNotification[]>([]);
  unreadCount = signal<number>(0);
  latestNotification = signal<AppNotification | null>(null);

  constructor(private http: HttpClient) {}

  // ── REST ──────────────────────────────────

  /** Plain observable version, useful for composing with forkJoin (e.g. dashboards) */
  fetchNotifications(): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(this.apiUrl);
  }

  loadNotifications(): void {
    this.http.get<AppNotification[]>(this.apiUrl).subscribe({
      next: (list) => {
        this.notifications.set(list);
        this.unreadCount.set(list.filter(n => !n.isRead).length);
      },
      error: () => {}
    });
  }


  markAsRead(id: number): void {
    this.http.put(`${this.apiUrl}/${id}/read`, {}).subscribe({
      next: () => {
        this.notifications.update(list =>
          list.map(n => n.id === id ? { ...n, isRead: true } : n));
        this.unreadCount.update(c => Math.max(0, c - 1));
      },
      error: () => {}
    });
  }
 markAllAsRead(): void {
  const unread = this.notifications().filter(n => !n.isRead);
  unread.forEach(n => {
    this.http.put(`${this.apiUrl}/${n.id}/read`, {}).subscribe({ error: () => {} });
  });

  // update locally
  this.notifications.update(list => list.map(n => ({ ...n, isRead: true })));
  this.unreadCount.set(0);
}
  // ── SignalR (live) ────────────────────────

  startConnection(): void {
    if (this.connection) return;  // already connected

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        accessTokenFactory: () => localStorage.getItem('token') ?? ''
      })
      .withAutomaticReconnect()
      .build();

    // server pushes a new notification → prepend it + bump the count + fire toast
    this.connection.on('ReceiveNotification', (notification: AppNotification) => {
      this.notifications.update(list => [notification, ...list]);
      this.unreadCount.update(c => c + 1);
      this.latestNotification.set(notification);
    });

    this.connection.start()
      .then(() => console.log('SignalR connected ✓'))
      .catch(err => console.error('SignalR failed:', err));
  }

  stopConnection(): void {
    this.connection?.stop();
    this.connection = undefined;
  }
}
