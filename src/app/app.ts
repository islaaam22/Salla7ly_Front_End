import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { Register } from './pages/register/register';
import { NotificationService } from './services/notification-service';
import { NotificationToast } from './pages/notification-toast/notification-toast';
import { filter } from 'rxjs/operators';



@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NotificationToast],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  title = 'salla7ly';

  private notificationService = inject(NotificationService);
  private router = inject(Router);

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.notificationService.startConnection();
      this.notificationService.loadNotifications();
    }

    // Scroll to top on route change
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        window.scrollTo(0, 0);
      });
  }
}
