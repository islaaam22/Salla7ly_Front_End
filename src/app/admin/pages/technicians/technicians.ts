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

  // Delete modal
  showDeleteModal = false;
  deleteTech: TechnicianWithVerification | null = null;
  deleting = false;
  deleteErrorMsg = '';

  // Action loading per card
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

  openDeleteModal(tech: TechnicianWithVerification): void {
    this.deleteTech = tech;
    this.deleteErrorMsg = '';
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.deleteTech = null;
    this.deleteErrorMsg = '';
  }

  confirmDelete(): void {
    if (!this.deleteTech) return;

    this.deleting = true;
    this.deleteErrorMsg = '';

    this.techService.deleteTechnician(this.deleteTech.id).subscribe({
      next: () => {
        this.deleting = false;
        this.allTechnicians = this.allTechnicians.filter(t => t.id !== this.deleteTech!.id);
        this.applyFilter(this.activeFilter);
        this.closeDeleteModal();
      },
      error: (err: any) => {
        this.deleting = false;
        this.deleteErrorMsg = err.error?.message || err.error?.title || 'حدث خطأ أثناء حذف الفني';
      }
    });
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
