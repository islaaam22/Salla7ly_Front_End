// src/app/admin/pages/technician-profile/technician-profile.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TechnicianAdminService } from '../../../services/technician-admin-service';
import {
  TechnicianAdmin,
  TechnicianVerification,
  PortfolioItem,
  TechnicianReview
} from '../../../models/technician-admin.model';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-technician-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './technician-profile.html',
  styleUrl: './technician-profile.css'
})
export class TechnicianProfileComponent implements OnInit {

  technicianId!: number;
  technician: TechnicianAdmin | null = null;
  portfolio: PortfolioItem[] = [];
  verification: TechnicianVerification | null = null;
  reviews: TechnicianReview[] = [];
  loading = true;
  error = '';

  // Lightbox
  lightboxUrl = '';
  lightboxOpen = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private techService: TechnicianAdminService
  ) {}

  ngOnInit(): void {
    this.technicianId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadAll();
  }

  loadAll(): void {
    this.loading = true;
    this.error = '';

    this.techService.getTechnicianById(this.technicianId).subscribe({
      next: (tech) => {
        this.technician = tech;

        // Load portfolio + verification in parallel
        forkJoin({
          portfolio: this.techService.getPortfolio(this.technicianId)
            .pipe(catchError(() => of([] as PortfolioItem[]))),
          verifications: this.techService.getVerificationByTechnician(this.technicianId)
            .pipe(catchError(() => of([] as TechnicianVerification[]))),
          reviews: tech.userId
            ? this.techService.getReviewsByTechnicianUserId(tech.userId)
                .pipe(catchError(() => of([] as TechnicianReview[])))
            : of([] as TechnicianReview[])
        }).subscribe({
          next: ({ portfolio, verifications, reviews }) => {
            this.portfolio = portfolio ?? [];
            this.verification = verifications?.[0] ?? null;
            this.reviews = reviews ?? [];
            this.loading = false;
          },
          error: () => {
            this.loading = false;
          }
        });
      },
      error: () => {
        this.error = 'لم يتم العثور على الفني';
        this.loading = false;
      }
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  img(url: string | null | undefined): string {
    return this.techService.fullUrl(url);
  }

  isValidImg(url: string | null | undefined): boolean {
    if (!url) return false;
    if (url.trim() === '' || url.startsWith('string')) return false;
    return true;
  }

  getInitial(name: string): string {
    return name?.charAt(0)?.toUpperCase() ?? '?';
  }

  getStatusLabel(): string {
    if (!this.technician) return '';
    if (this.technician.isActive === false) return 'موقف';
    if (this.technician.isApproved) return 'موثق';
    if (this.verification) return 'قيد المراجعة';
    return 'غير موثق';
  }

  getStatusClass(): string {
    if (!this.technician) return '';
    if (this.technician.isActive === false) return 'badge-suspended';
    if (this.technician.isApproved) return 'badge-approved';
    if (this.verification) return 'badge-pending';
    return 'badge-new';
  }

  getCertificates(): string[] {
    if (!this.technician) return [];
    if (Array.isArray(this.technician.certificates) && this.technician.certificates.length > 0) {
      return this.technician.certificates;
    }
    // Fallback: try to extract from verification degree certificates
    if (this.verification?.degreeCertificateUrls?.length) {
      return this.verification.degreeCertificateUrls.map((_, i) => `شهادة ${i + 1}`);
    }
    return [];
  }

  getCompletionRate(): string {
    if (!this.technician) return '—';
    if (this.technician.completionRate != null) return this.technician.completionRate + '%';
    // Derive from completed jobs if completedJobs > 0
    if (this.technician.completedJobs && this.technician.completedJobs > 0) return '—';
    return '—';
  }

  // ── Verification docs ────────────────────────────────────────────────────

  getVerificationDocs(): { label: string; url: string; isPdf: boolean }[] {
    if (!this.verification) return [];
    const docs: { label: string; url: string; isPdf: boolean }[] = [];

    if (this.verification.documentUrlFront) {
      const url = this.techService.fullUrl(this.verification.documentUrlFront);
      docs.push({ label: 'صورة الهوية (أمامية)', url, isPdf: false });
    }
    if (this.verification.documentUrlBack) {
      const url = this.techService.fullUrl(this.verification.documentUrlBack);
      docs.push({ label: 'صورة الهوية (خلفية)', url, isPdf: false });
    }
    if (this.verification.degreeCertificateUrls?.length) {
      this.verification.degreeCertificateUrls.forEach((c, i) => {
        const url = this.techService.fullUrl(c);
        const isPdf = url.toLowerCase().endsWith('.pdf');
        docs.push({ label: `شهادة ${i + 1}`, url, isPdf });
      });
    }
    return docs;
  }

  // ── Portfolio ────────────────────────────────────────────────────────────

  getPortfolioItems(): PortfolioItem[] {
    return this.portfolio;
  }

  getPortfolioAfterUrl(item: PortfolioItem): string {
    return this.techService.fullUrl(item.imageUrlAfter);
  }

  getPortfolioBeforeUrl(item: PortfolioItem): string {
    return this.techService.fullUrl(item.imageUrlBefore);
  }

  hasAfterImage(item: PortfolioItem): boolean {
    return this.isValidImg(item.imageUrlAfter);
  }

  hasBeforeImage(item: PortfolioItem): boolean {
    return this.isValidImg(item.imageUrlBefore);
  }

  // ── Reviews ──────────────────────────────────────────────────────────────

  getOverallScore(r: TechnicianReview): number {
    if (r.overallScore != null) return r.overallScore;
    if (r.rating != null) return r.rating;
    const scores = [r.qualityScore, r.punctualityScore, r.communicationScore, r.valueScore]
      .filter(s => s != null) as number[];
    if (scores.length === 0) return 0;
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  getStarArray(): number[] {
    return [1, 2, 3, 4, 5];
  }

  isStarFilled(star: number, rating: number): boolean {
    return star <= Math.round(rating);
  }

  // ── Lightbox ──────────────────────────────────────────────────────────────

  openLightbox(url: string): void {
    this.lightboxUrl = url;
    this.lightboxOpen = true;
  }

  closeLightbox(): void {
    this.lightboxOpen = false;
    this.lightboxUrl = '';
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  goBack(): void {
    this.router.navigate(['/admin/technicians']);
  }
}
