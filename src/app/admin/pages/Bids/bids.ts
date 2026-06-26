import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Auth } from '../../../services/auth';

interface Bid {
  id: number;
  serviceRequestId: number;
  serviceRequestTitle: string;
  technicianId: number;
  technicianName: string;
  technicianAvatar: string | null;
  technicianRating: number;
  technicianJobs: number;
  customerName: string;
  customerAvatar: string | null;
  price: number;
  estimatedDurationMinutes: number;
  proposalMessage: string;
  status: string;
  submittedAt: string;
  respondedAt: string | null;
}

type FilterTab = 'all' | 'pending' | 'accepted' | 'rejected';

@Component({
  selector: 'app-admin-bids',
  imports: [CommonModule, FormsModule],
  templateUrl: './bids.html',
  styleUrl: './bids.css',
})
export class AdminBids implements OnInit {
  private apiUrl = 'https://sala7ly.runasp.net/api';

  loading = true;
  errorMsg = '';

  bids: Bid[] = [];
  searchTerm = '';
  activeTab: FilterTab = 'all';

  // ── Edit modal ────────────────────────────────────────────────
  showEditModal = false;
  editSaving = false;
  editErrorMsg = '';
  editId: number | null = null;
  editPrice: number = 0;
  editProposalMessage: string = '';
  editDurationMinutes: number = 0;
  editStatus: string = 'pending';
  editRequestTitle: string = '';
  editTechnicianName: string = '';

  // ── Delete modal ──────────────────────────────────────────────
  showDeleteModal = false;
  deleteBid: Bid | null = null;
  deleting = false;
  deleteErrorMsg = '';

  // ── Approve / Reject loading ──────────────────────────────────
  actionLoadingId: number | null = null;

  constructor(private http: HttpClient, private authService: Auth) {}

  ngOnInit() {
    this.loadBids();
  }

  private authHeaders(): HttpHeaders {
    let token = this.authService.getToken() || '';
    if (token.startsWith('Bearer ')) token = token.substring(7);
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  loadBids() {
    this.loading = true;
    this.errorMsg = '';

    this.http.get<any>(`${this.apiUrl}/admin/bids`, { headers: this.authHeaders() }).subscribe({
      next: (res) => {
        this.bids = res?.data || res || [];
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        if (err.status === 401 || err.status === 403) {
          this.errorMsg = 'غير مصرح لك بالوصول لهذه البيانات';
        } else {
          this.errorMsg = 'تعذّر تحميل العروض';
        }
      }
    });
  }

  // ── Tab counts ──────────────────────────────────────────────────
  get countAll(): number { return this.bids.length; }
  get countPending(): number { return this.bids.filter(b => b.status === 'pending').length; }
  get countAccepted(): number { return this.bids.filter(b => b.status === 'accepted').length; }
  get countRejected(): number { return this.bids.filter(b => b.status === 'rejected').length; }

  setTab(tab: FilterTab) {
    this.activeTab = tab;
  }

  // ── Filtered list ───────────────────────────────────────────────
  get filteredBids(): Bid[] {
    let list = this.bids;

    switch (this.activeTab) {
      case 'pending': list = list.filter(b => b.status === 'pending'); break;
      case 'accepted': list = list.filter(b => b.status === 'accepted'); break;
      case 'rejected': list = list.filter(b => b.status === 'rejected'); break;
    }

    const term = this.searchTerm.trim().toLowerCase();
    if (term) {
      list = list.filter(b =>
        b.serviceRequestTitle?.toLowerCase().includes(term) ||
        b.technicianName?.toLowerCase().includes(term) ||
        b.customerName?.toLowerCase().includes(term) ||
        `r${b.serviceRequestId}`.toLowerCase().includes(term)
      );
    }

    return list;
  }

  // ── Helpers ─────────────────────────────────────────────────────
  statusLabel(status: string): string {
    const map: Record<string, string> = {
      pending: 'قيد المراجعة',
      accepted: 'مقبول',
      rejected: 'مرفوض',
    };
    return map[status] || status;
  }

  statusBg(status: string): string {
    const map: Record<string, string> = {
      pending: '#fef3c7',
      accepted: '#e8fdf2',
      rejected: '#fde8e8',
    };
    return map[status] || '#f0f4f8';
  }

  statusColor(status: string): string {
    const map: Record<string, string> = {
      pending: '#d97706',
      accepted: '#1a7a47',
      rejected: '#ef4444',
    };
    return map[status] || '#64748b';
  }

  formatDuration(minutes: number): string {
    if (!minutes) return '—';
    if (minutes < 60) return `${minutes} دقيقة`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (m === 0) {
      if (h === 1) return 'ساعة';
      if (h === 2) return 'ساعتين';
      return `${h} ساعات`;
    }
    return `${h} ساعة و${m} دقيقة`;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    const months = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  avatarLetter(name: string): string {
    return (name || '?').trim().charAt(0).toUpperCase();
  }

  // ── EDIT (pending only) ──────────────────────────────────────────
  onEdit(bid: Bid) {
    this.showEditModal = true;
    this.editErrorMsg = '';
    this.editId = bid.id;
    this.editPrice = bid.price;
    this.editDurationMinutes = bid.estimatedDurationMinutes;
    this.editProposalMessage = bid.proposalMessage || '';
    this.editStatus = bid.status;
    this.editRequestTitle = bid.serviceRequestTitle;
    this.editTechnicianName = bid.technicianName;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editId = null;
  }

  onSaveEdit() {
    if (!this.editId) return;

    if (!this.editPrice || this.editPrice <= 0) {
      this.editErrorMsg = 'يرجى إدخال سعر صحيح';
      return;
    }

    this.editSaving = true;
    this.editErrorMsg = '';

    const body = {
      price: this.editPrice,
      proposalMessage: this.editProposalMessage,
      estimatedDurationMinutes: this.editDurationMinutes,
      status: this.editStatus,
    };

    this.http.put<any>(`${this.apiUrl}/bids/${this.editId}`, body, { headers: this.authHeaders() }).subscribe({
      next: (res) => {
        this.editSaving = false;
        // Update the bid in the list locally from response
        const updated = res?.data;
        if (updated) {
          const idx = this.bids.findIndex(b => b.id === this.editId);
          if (idx !== -1) this.bids[idx] = updated;
        }
        this.closeEditModal();
      },
      error: (err: any) => {
        this.editSaving = false;
        this.editErrorMsg = err.error?.message || 'حدث خطأ أثناء حفظ التعديلات';
      }
    });
  }

  // ── DELETE ───────────────────────────────────────────────────────
  onDelete(bid: Bid) {
    this.showDeleteModal = true;
    this.deleteBid = bid;
    this.deleteErrorMsg = '';
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.deleteBid = null;
  }

  confirmDelete() {
    if (!this.deleteBid) return;

    this.deleting = true;
    this.deleteErrorMsg = '';

    this.http.delete(`${this.apiUrl}/bids/${this.deleteBid.id}`, { headers: this.authHeaders() }).subscribe({
      next: () => {
        this.deleting = false;
        this.bids = this.bids.filter(b => b.id !== this.deleteBid!.id);
        this.closeDeleteModal();
      },
      error: (err: any) => {
        this.deleting = false;
        if (err.status === 500) {
          this.deleteErrorMsg = 'لا يمكن حذف هذا العرض لارتباطه ببيانات أخرى';
        } else {
          this.deleteErrorMsg = err.error?.message || 'حدث خطأ أثناء حذف العرض';
        }
      }
    });
  }
  

  // ── APPROVE ──────────────────────────────────────────────────────
  onApprove(bid: Bid) {
    this.actionLoadingId = bid.id;

    this.http.put<any>(`${this.apiUrl}/bids/${bid.id}/accept`, {}, { headers: this.authHeaders() }).subscribe({
      next: () => {
        this.actionLoadingId = null;
        const found = this.bids.find(b => b.id === bid.id);
        if (found) found.status = 'accepted';
      },
      error: (err: any) => {
        this.actionLoadingId = null;
        alert(err.error?.message || 'حدث خطأ أثناء قبول العرض');
      }
    });
  }

  // ── REJECT ───────────────────────────────────────────────────────
  onReject(bid: Bid) {
    this.actionLoadingId = bid.id;

    this.http.put<any>(`${this.apiUrl}/bids/${bid.id}/reject`, {}, { headers: this.authHeaders() }).subscribe({
      next: () => {
        this.actionLoadingId = null;
        const found = this.bids.find(b => b.id === bid.id);
        if (found) found.status = 'rejected';
      },
      error: (err: any) => {
        this.actionLoadingId = null;
        alert(err.error?.message || 'حدث خطأ أثناء رفض العرض');
      }
    });
  }
}