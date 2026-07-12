import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Auth } from '../../../services/auth';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-technician-profile',
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class TechnicianProfile implements OnInit {
  profile: any = null;
  loading = true;
  errorMsg = '';
  avatarLetter = '';
  completedCount = 0;   // real completed-tasks count

  private apiUrl = 'https://sala7ly.runasp.net/api';
  private apiBase = 'https://sala7ly.runasp.net';

  constructor(private http: HttpClient, private authService: Auth) {}

  ngOnInit() {
    this.loadProfile();
    this.loadCompletedCount();
  }

  private authHeaders(): HttpHeaders {
    let token = this.authService.getToken() || '';
    if (token.startsWith('Bearer ')) token = token.substring(7);
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  loadProfile() {
    this.http.get(`${this.apiUrl}/Technician/mine`, { headers: this.authHeaders() }).subscribe({
      next: (data: any) => {
        this.profile = data;
        this.avatarLetter = (data.name || 'F').charAt(0).toUpperCase();
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'تعذّر تحميل الملف الشخصي';
        this.loading = false;
      },
    });
  }

  loadCompletedCount() {
    this.http.get<any[]>(`${this.apiUrl}/requests/assigned`, { headers: this.authHeaders() }).subscribe({
      next: (tasks) => {
        this.completedCount = tasks.filter((t) => t.status === 'completed').length;
      },
      error: () => {},
    });
  }

  fixImageUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http')) return url.replace('http://localhost:5296', this.apiBase);
    return `${this.apiBase}${url}`;
  }
}