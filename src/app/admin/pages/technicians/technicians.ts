// src/app/admin/pages/technicians/technicians.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TechnicianAdminService } from '../../../services/technician-admin-service';
import { TechnicianWithVerification } from '../../../models/technician-admin.model';

type FilterKey = 'all' | 'approved' | 'pending' | 'rejected';

@Component({
  selector: 'app-technicians',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './technicians.html',
  styleUrl: './technicians.css'
})
export class TechniciansComponent implements OnInit {

  allTechnicians: TechnicianWithVerification[] = [];
  filteredTechnicians: TechnicianWithVerification[] = [];
  loading = true;
  error = '';
  activeFilter: FilterKey = 'all';

  // Reject modal
  showRejectModal = false;
  rejectReason = '';
  selectedTech: TechnicianWithVerification | null = null;
  rejecting = false;

  // Approve / suspend loading per card
  processingId: number | null = null;

  filters: { label: string; value: FilterKey }[] = [
    { label: 'الكل',        value: 'all'      },
    { label: 'قيد المراجعة', value: 'pending'  },
    { label: 'موثق',        value: 'approved' },
    { label: 'مرفوض',       value: 'rejected' },
  ];

  constructor(
    private techService: TechnicianAdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = '';
    this.techService.getAllTechniciansEnriched().subscribe({
      next: (techs) => {
        this.allTechnicians = techs;
        this.applyFilter(this.activeFilter);
        this.loading = false;
      },
      error: () => {
        this.error = 'حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.';
        this.loading = false;
      }
    });
  }

  applyFilter(filter: FilterKey): void {
    this.activeFilter = filter;
    if (filter === 'all') {
      this.filteredTechnicians = this.allTechnicians;
    } else {
      this.filteredTechnicians = this.allTechnicians.filter(t => t.uiStatus === filter);
    }
  }

  getFilterCount(filter: FilterKey): number {
    if (filter === 'all') return this.allTechnicians.length;
    return this.allTechnicians.filter(t => t.uiStatus === filter).length;
  }

  // ── Status helpers ────────────────────────────────────────────────────────

  getStatusLabel(tech: TechnicianWithVerification): string {
    switch (tech.uiStatus) {
      case 'approved': return 'موثق';
      case 'pending':  return 'قيد المراجعة';
      case 'rejected': return 'مرفوض';
      default:         return 'جديد';
    }
  }

  getStatusClass(tech: TechnicianWithVerification): string {
    switch (tech.uiStatus) {
      case 'approved': return 'badge-approved';
      case 'pending':  return 'badge-pending';
      case 'rejected': return 'badge-rejected';
      default:         return 'badge-new';
    }
  }

  getInitial(name: string): string {
    return name?.charAt(0)?.toUpperCase() ?? '?';
  }

  isPending(tech: TechnicianWithVerification): boolean {
    return tech.uiStatus === 'pending';
  }

  isApproved(tech: TechnicianWithVerification): boolean {
    return tech.uiStatus === 'approved';
  }

  isSuspended(tech: TechnicianWithVerification): boolean {
    return tech.uiStatus === 'rejected' && tech.isActive === false;
  }

  isProcessing(tech: TechnicianWithVerification): boolean {
    return this.processingId === tech.id;
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  approve(tech: TechnicianWithVerification): void {
    if (!tech.verification?.id) {
      // No verification record — fetch by technicianId first
      this.processingId = tech.id;
      this.techService.getVerificationByTechnician(tech.id).subscribe({
        next: (list) => {
          const v = list?.[0];
          if (v?.id) {
            this.doApprove(tech, v.id);
          } else {
            this.processingId = null;
            alert('لا يوجد طلب توثيق لهذا الفني');
          }
        },
        error: () => {
          this.processingId = null;
          alert('حدث خطأ أثناء الاعتماد');
        }
      });
      return;
    }
    this.doApprove(tech, tech.verification.id);
  }

  private doApprove(tech: TechnicianWithVerification, verificationId: number): void {
    this.processingId = tech.id;
    this.techService.approve(verificationId).subscribe({
      next: () => {
        this.processingId = null;
        this.loadData();
      },
      error: () => {
        this.processingId = null;
        alert('حدث خطأ أثناء الاعتماد');
      }
    });
  }

  openRejectModal(tech: TechnicianWithVerification): void {
    this.selectedTech = tech;
    this.rejectReason = '';
    this.showRejectModal = true;
  }

  closeRejectModal(): void {
    this.showRejectModal = false;
    this.selectedTech = null;
    this.rejectReason = '';
  }

  confirmReject(): void {
    if (!this.rejectReason.trim() || !this.selectedTech) return;

    this.rejecting = true;
    const verificationId = this.selectedTech.verification?.id;

    if (!verificationId) {
      this.techService.getVerificationByTechnician(this.selectedTech.id).subscribe({
        next: (list) => {
          const v = list?.[0];
          if (v?.id) {
            this.doReject(v.id, this.rejectReason);
          } else {
            this.rejecting = false;
            alert('لا يوجد طلب توثيق لهذا الفني');
          }
        },
        error: () => {
          this.rejecting = false;
          alert('حدث خطأ أثناء الرفض');
        }
      });
      return;
    }
    this.doReject(verificationId, this.rejectReason);
  }

  private doReject(verificationId: number, reason: string): void {
    this.techService.reject(verificationId, reason).subscribe({
      next: () => {
        this.rejecting = false;
        this.closeRejectModal();
        this.loadData();
      },
      error: () => {
        this.rejecting = false;
        alert('حدث خطأ أثناء الرفض');
      }
    });
  }

  suspend(tech: TechnicianWithVerification): void {
    if (!confirm(`هل تريد تعليق الفني "${tech.name}"؟`)) return;
    this.processingId = tech.id;

    const doSuspend = (userId: string) => {
      this.techService.suspend(userId).subscribe({
        next: () => { this.processingId = null; this.loadData(); },
        error: () => { this.processingId = null; alert('حدث خطأ أثناء التعليق'); }
      });
    };

    if (tech.userId) {
      doSuspend(tech.userId);
    } else {
      // Fetch full details to get userId
      this.techService.getTechnicianById(tech.id).subscribe({
        next: (detail) => {
          if (detail.userId) {
            doSuspend(detail.userId);
          } else {
            this.processingId = null;
            alert('لا يمكن تعليق هذا الفني: معرّف المستخدم غير متوفر');
          }
        },
        error: () => { this.processingId = null; alert('حدث خطأ أثناء التعليق'); }
      });
    }
  }

  reactivate(tech: TechnicianWithVerification): void {
    if (!confirm(`هل تريد إعادة تفعيل الفني "${tech.name}"؟`)) return;
    this.processingId = tech.id;

    const doReactivate = (userId: string) => {
      this.techService.reactivate(userId).subscribe({
        next: () => { this.processingId = null; this.loadData(); },
        error: () => { this.processingId = null; alert('حدث خطأ أثناء إعادة الاعتماد'); }
      });
    };

    if (tech.userId) {
      doReactivate(tech.userId);
    } else {
      this.techService.getTechnicianById(tech.id).subscribe({
        next: (detail) => {
          if (detail.userId) {
            doReactivate(detail.userId);
          } else {
            this.processingId = null;
            alert('لا يمكن تفعيل هذا الفني: معرّف المستخدم غير متوفر');
          }
        },
        error: () => { this.processingId = null; alert('حدث خطأ أثناء إعادة الاعتماد'); }
      });
    }
  }

  viewProfile(id: number): void {
    this.router.navigate(['/admin/technicians', id]);
  }

  resolveImage(url: string | null | undefined): string {
    return this.techService.resolveImageUrl(url);
  }

  isValidImage(url: string | null | undefined): boolean {
    if (!url) return false;
    if (url.startsWith('string')) return false;
    if (url.trim() === '') return false;
    return true;
  }
}
