import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private apiUrl = 'https://sala7ly.runasp.net/api/TechnicianPortfolios';

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getByTechnicianId(technicianId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/technician/${technicianId}`, {
      headers: this.getHeaders()
    });
  }

  create(dto: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, dto, {
      headers: this.getHeaders()
    });
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }
}
