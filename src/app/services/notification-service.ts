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

  constructor(private http: HttpClient) {}

  // ── REST ──────────────────────────────────

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

  // ── SignalR (live) ────────────────────────

  startConnection(): void {
    if (this.connection) return;  // already connected

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        accessTokenFactory: () => localStorage.getItem('token') ?? ''
      })
      .withAutomaticReconnect()
      .build();

    // server pushes a new notification → prepend it + bump the count
    this.connection.on('ReceiveNotification', (notification: AppNotification) => {
      this.notifications.update(list => [notification, ...list]);
      this.unreadCount.update(c => c + 1);
    });

    this.connection.start().catch(() => {});
  }

  stopConnection(): void {
    this.connection?.stop();
    this.connection = undefined;
  }
}