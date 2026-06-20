import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface DashboardStats {
  totalCustomers: number;
  totalTechnicians: number;
  activeRequests: number;
  completedTasks: number;
  monthlyRevenue: number;
  growth: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

    private readonly baseUrl = 'https://sala7ly.runasp.net/api/Admin';

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(
      `${this.baseUrl}/dashboard`
    );
  }
}
