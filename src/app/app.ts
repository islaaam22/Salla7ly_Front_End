import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Register } from './pages/register/register';
import { NotificationService } from './services/notification-service';
import { NotificationToast } from './pages/notification-toast/notification-toast';



@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NotificationToast],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  title = 'salla7ly';

  private notificationService = inject(NotificationService);

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.notificationService.startConnection();
      this.notificationService.loadNotifications();
    }
  }
}