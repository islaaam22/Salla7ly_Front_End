import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class Auth {
  private apiUrl = 'https://sala7ly.runasp.net/api';

  constructor(private http: HttpClient) {}

  login(email: string, password: string, role: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, { email, password, role });
  }

  refreshToken(): Observable<any> {
    const token = this.getToken();
    const refreshToken = this.getRefreshToken();
    return this.http.post(`${this.apiUrl}/auth/refresh-token`, {
      token,
      refreshToken
    });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('role');
  }

  saveToken(token: string, role: string, refreshToken?: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
