import { Component, OnInit, Inject } from '@angular/core';
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

  private apiUrl = 'https://sala7ly.runasp.net/api';

  constructor(private http: HttpClient, private authService: Auth) {}

  ngOnInit() {
    this.loadProfile();
  }

loadProfile() {
  let token = this.authService.getToken() || '';
  console.log('Raw token from storage:', token);
  console.log('Token length:', token.length);
  
  if (token.startsWith('Bearer ')) {
    token = token.substring(7);
  }
  console.log('Final token sent:', token);
const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

  this.http.get(`${this.apiUrl}/Technician/mine`, { headers }).subscribe({
  next: (data: any) => {
    this.profile = data;
    this.avatarLetter = (data.name || 'F').charAt(0).toUpperCase();
    this.loading = false;
  },
  error: (err: any) => {
    this.errorMsg = 'تعذّر تحميل الملف الشخصي';
    this.loading = false;
  }
});

  }
}