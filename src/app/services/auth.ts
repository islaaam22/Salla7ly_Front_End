import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private apiUrl = 'https://localhost:7000/api';

  constructor(private http: HttpClient) {}

  login(email: string, password: string, role: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, { email, password, role });
  }

  registerCustomer(formData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register/customer`, formData);
  }

  registerTechnician(formData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register/technician`, formData);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  }

  saveToken(token: string, role: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
