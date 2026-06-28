import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import {
  TechnicianAdmin,
  TechnicianVerification,
  PortfolioItem,
  TechnicianReview,
  TechnicianWithVerification
} from '../models/technician-admin.model';

@Injectable({ providedIn: 'root' })
export class TechnicianAdminService {
  private readonly apiUrl = 'https://sala7ly.runasp.net/api';
  private readonly baseUrl = 'https://sala7ly.runasp.net';

  constructor(private http: HttpClient) {}

  // ── Technicians ─────────────────────────────────────────────────────────────

  getAllTechnicians(): Observable<TechnicianAdmin[]> {
    return this.http.get<TechnicianAdmin[]>(`${this.apiUrl}/Technician`);
  }

  getTechnicianById(id: number): Observable<TechnicianAdmin> {
    return this.http.get<TechnicianAdmin>(`${this.apiUrl}/Technician/${id}`);
  }

  getAllTechniciansEnriched(): Observable<TechnicianWithVerification[]> {
    return this.getAllTechnicians().pipe(
      switchMap((techs) => {
        if (!techs || techs.length === 0) return of([]);
        const detail$ = techs.map((t) =>
          this.getVerificationByTechnician(t.id).pipe(
            catchError(() => of([] as TechnicianVerification[])),
            map((verifications) => {
              const latest = verifications?.[0] ?? null;
              return {
                ...t,
                verification: latest,
                uiStatus: this.deriveStatus(t, latest)
              } as TechnicianWithVerification;
            })
          )
        );
        return forkJoin(detail$);
      })
    );
  }

  private deriveStatus(
    tech: TechnicianAdmin,
    v: TechnicianVerification | null
  ): 'approved' | 'pending' | 'rejected' | 'new' {
    if (tech.isActive === false) return 'rejected';
    if (tech.isApproved) return 'approved';
    if (v && v.status === 'Pending') return 'pending';
    if (v && v.status === 'Rejected') return 'rejected';
    if (v) return 'pending';
    return 'new';
  }

  // ── Portfolio ────────────────────────────────────────────────────────────────

  getPortfolio(technicianId: number): Observable<PortfolioItem[]> {
    return this.http.get<PortfolioItem[]>(
      `${this.apiUrl}/TechnicianPortfolios/technician/${technicianId}`
    );
  }

  // ── Verification ─────────────────────────────────────────────────────────────

  getVerificationByTechnician(technicianId: number): Observable<TechnicianVerification[]> {
    return this.http.get<TechnicianVerification[]>(
      `${this.apiUrl}/TechnicianVerification/technician/${technicianId}`
    );
  }

  getVerificationById(id: number): Observable<TechnicianVerification> {
    return this.http.get<TechnicianVerification>(
      `${this.apiUrl}/TechnicianVerification/${id}`
    );
  }

  getPendingVerifications(): Observable<TechnicianVerification[]> {
    return this.http.get<TechnicianVerification[]>(
      `${this.apiUrl}/TechnicianVerification/pending`
    );
  }

  approve(verificationId: number): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/TechnicianVerification/${verificationId}/approve`,
      {}
    );
  }

  reject(verificationId: number, rejectionReason: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/TechnicianVerification/reject`, {
      verificationId,
      rejectionReason
    });
  }

  // ── Suspend / Reactivate ────────────────────────────────────────────────────

  suspend(userId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/Auth/deactivate`, { userId });
  }

  reactivate(userId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/Auth/reactivate`, { userId });
  }

  // ── Reviews ──────────────────────────────────────────────────────────────────
  // Accepts the ASP.NET Identity userId (GUID string) — NOT the numeric technicianId

  getReviewsByTechnicianUserId(userId: string): Observable<TechnicianReview[]> {
    return this.http.get<TechnicianReview[]>(
      `${this.apiUrl}/Review/technician/${userId}`
    );
  }

  // ── Image URL helpers ─────────────────────────────────────────────────────────

  resolveImageUrl(url: string | null | undefined): string {
    if (!url) return '';
    return url
      .replace('http://localhost:5296', this.baseUrl)
      .replace('http://localhost:5000', this.baseUrl);
  }

  fullUrl(path: string | null | undefined): string {
    if (!path) return '';
    if (path.startsWith('http')) return this.resolveImageUrl(path);
    return `${this.baseUrl}${path}`;
  }
}
