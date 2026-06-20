import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private apiUrl = 'https://sala7ly.runasp.net/api/TechnicianPortfolios';

  constructor(private http: HttpClient) {}

  private getToken(): string {
    return localStorage.getItem('token') ?? '';
  }

  getByTechnicianId(technicianId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/technician/${technicianId}`, {
      headers: new HttpHeaders({ 'Authorization': `Bearer ${this.getToken()}` })
    });
  }

  create(dto: any): Observable<any> {
    const formData = new FormData();
    formData.append('TechnicianId', dto.technicianId.toString());
    formData.append('Title', dto.caption); 

    if (dto.description) {
      formData.append('Description', dto.description);
    }
    if (dto.beforeImage) {
      formData.append('BeforeImage', dto.beforeImage, dto.beforeImage.name);
    }
    if (dto.afterImage) {
      formData.append('AfterImage', dto.afterImage, dto.afterImage.name);
    }

    return this.http.post(`${this.apiUrl}`, formData, {
      headers: new HttpHeaders({ 'Authorization': `Bearer ${this.getToken()}` })
    });
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: new HttpHeaders({ 'Authorization': `Bearer ${this.getToken()}` })
    });
  }

  getMyProfile(): Observable<any> {
    return this.http.get(`https://sala7ly.runasp.net/api/Technician/mine`, {
      headers: new HttpHeaders({ 'Authorization': `Bearer ${this.getToken()}` })
    });
  }
}
