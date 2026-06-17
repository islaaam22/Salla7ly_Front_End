import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Auth } from '../../../services/auth';

type VerificationStatus = 'none' | 'pending' | 'approved' | 'rejected';

@Component({
  selector: 'app-technician-verification',
  imports: [CommonModule, FormsModule],
  templateUrl: './verification.html',
  styleUrl: './verification.css',
})
export class TechnicianVerification implements OnInit {
  private apiUrl = 'https://sala7ly.runasp.net/api';

  // View state
  loadingStatus = true;
  status: VerificationStatus = 'none';
  rejectionReason = '';

  // Form fields
  nationalId = '';
  idFrontFile: File | null = null;
  idBackFile: File | null = null;
  idFrontPreview: string | null = null;
  idBackPreview: string | null = null;

  certificates: File[] = [];

  experienceYears: number | null = null;
  bio = '';

  submitting = false;
  errorMsg = '';

  constructor(
    private http: HttpClient,
    private authService: Auth,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadStatus();
  }

  private authHeaders(): HttpHeaders {
    let token = this.authService.getToken() || '';
    if (token.startsWith('Bearer ')) token = token.substring(7);
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // ── Load current verification status ───────────────────────────

  loadStatus() {
    this.loadingStatus = true;

    this.http.get(`${this.apiUrl}/Technician/verification-status`, { headers: this.authHeaders() }).subscribe({
      next: (data: any) => {
        this.status = (data?.status || 'none').toLowerCase();
        this.rejectionReason = data?.rejectionReason || '';
        this.loadingStatus = false;
      },

      error: () => {
        // If the endpoint doesn't exist yet or fails, just show the form
        this.status = 'none';
        this.loadingStatus = false;
      }

    });
  }



  // ── File handlers ───────────────────────────────────────────────
  onIdFrontSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.idFrontFile = file;
      this.idFrontPreview = URL.createObjectURL(file);
    }
  }

  onIdBackSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.idBackFile = file;
      this.idBackPreview = URL.createObjectURL(file);
    }
  }

  onCertificatesSelected(event: any) {
    const files: FileList = event.target.files;
    for (let i = 0; i < files.length; i++) {
      this.certificates.push(files[i]);
    }
  }

  removeCertificate(index: number) {
    this.certificates.splice(index, 1);
  }

  // ── Validation ──────────────────────────────────────────────────
  validateForm(): boolean {
    this.errorMsg = '';
    if (!this.nationalId || this.nationalId.length !== 14) {
      this.errorMsg = 'يرجى إدخال رقم بطاقة قومية صحيح (14 رقم)';
      return false;
    }
    if (!this.idFrontFile || !this.idBackFile) {
      this.errorMsg = 'يرجى رفع صورة وجه وظهر البطاقة';
      return false;
    }
    if (!this.experienceYears || this.experienceYears < 0) {
      this.errorMsg = 'يرجى إدخال عدد سنوات الخبرة';
      return false;
    }
    if (!this.bio || this.bio.trim().length < 10) {
      this.errorMsg = 'يرجى كتابة وصف مختصر لا يقل عن 10 أحرف';
      return false;
    }
    return true;
  }

  // ── Submit ──────────────────────────────────────────────────────

  onSubmitForReview() {
    if (!this.validateForm()) return;

    this.submitting = true;
    this.errorMsg = '';

    const formData = new FormData();
    formData.append('NationalId', this.nationalId);
    formData.append('ExperienceYears', this.experienceYears!.toString());
    formData.append('Bio', this.bio);
    if (this.idFrontFile) formData.append('IdFrontImage', this.idFrontFile, this.idFrontFile.name);
    if (this.idBackFile) formData.append('IdBackImage', this.idBackFile, this.idBackFile.name);
    this.certificates.forEach((cert) => {
      formData.append('Certificates', cert, cert.name);
    });

    this.http.post(`${this.apiUrl}/Technician/verify`, formData, { headers: this.authHeaders() }).subscribe({
      next: () => {
        this.submitting = false;
        this.status = 'pending';
      },
      error: (err: any) => {
        this.submitting = false;
        this.errorMsg = err.error?.message || 'حدث خطأ أثناء إرسال الطلب';
      }
    });
  }

  // ── Allow editing documents while pending ────────────────────────
  onEditDocuments() {
    this.status = 'none';
  }
  
}