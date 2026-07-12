import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Auth } from '../../../services/auth';
import { RequestService } from '../../../services/request';

interface Request {
  id: number;
  title: string;
  status: string;
  urgency: string;
  isEmergency: boolean;
  scheduledAt: string;
  categoryId: number;
  customerName: string;
  // AI price estimation fields (admin only)
  aiPriceMin: number;
  aiPriceMax: number;
  addressId?: number;
  address?: string;
}

interface RequestDetail {
  id: number;
  title: string;
  description: string;
  imageUrls: string[];
  urgency: string;
  status: string;
  bookingMode: string;
  isEmergency: boolean;
  aiPriceMin: number;
  aiPriceMax: number;
  scheduledAt: string;
  completedAt: string | null;
  customerId: number;
  categoryId: number;
  addressId: number;
  createdOn: string | null;
  customerName: string;
  categoryName: string;
  address: string;
}

type FilterTab = 'all' | 'open' | 'assigned' | 'emergency' | 'completed' | 'cancelled';

@Component({
  selector: 'app-admin-requests',
  imports: [CommonModule, FormsModule],
  templateUrl: './requests.html',
  styleUrl: './requests.css',
})
export class AdminRequests implements OnInit {
  private apiUrl = 'https://sala7ly.runasp.net/api';

  loading = true;
  errorMsg = '';

  requests: Request[] = [];
  searchTerm = '';
  activeTab: FilterTab = 'all';

  // ── View modal ────────────────────────────────────────────────
  showViewModal = false;
  viewLoading = false;
  viewRequest: RequestDetail | null = null;

  // ── Edit modal ────────────────────────────────────────────────
  showEditModal = false;
  editLoading = false;
  editSaving = false;
  editErrorMsg = '';
  editId: number | null = null;
  editTitle = '';
  editDescription = '';
  editScheduledAt = '';

  // ── Delete modal ──────────────────────────────────────────────
  showDeleteModal = false;
  deleteRequest: Request | null = null;
  deleting = false;
  deleteErrorMsg = '';

  constructor(
    private http: HttpClient,
    private authService: Auth,
    private requestService: RequestService
  ) {}

  ngOnInit() {
    this.loadRequests();
  }

  private authHeaders(): HttpHeaders {
    let token = this.authService.getToken() || '';
    if (token.startsWith('Bearer ')) token = token.substring(7);
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  loadRequests() {
    this.loading = true;
    this.errorMsg = '';

    this.http.get<Request[]>(`${this.apiUrl}/requests`, { headers: this.authHeaders() }).subscribe({
      next: (data) => {
        this.requests = data || [];
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        if (err.status === 401 || err.status === 403) {
          this.errorMsg = 'غير مصرح لك بالوصول لهذه البيانات';
        } else {
          this.errorMsg = 'تعذّر تحميل الطلبات';
        }
      }
    });
  }

  // ── Tab counts ──────────────────────────────────────────────────
  get countAll(): number { return this.requests.length; }
  get countOpen(): number { return this.requests.filter(r => r.status === 'open').length; }
  get countAssigned(): number { return this.requests.filter(r => r.status === 'assigned').length; }
  get countEmergency(): number { return this.requests.filter(r => r.isEmergency).length; }
  get countCompleted(): number { return this.requests.filter(r => r.status === 'completed').length; }
  get countCancelled(): number { return this.requests.filter(r => r.status === 'cancelled').length; }

  setTab(tab: FilterTab) {
    this.activeTab = tab;
  }

  // ── Filtered list ───────────────────────────────────────────────
  get filteredRequests(): Request[] {
    let list = this.requests;

    switch (this.activeTab) {
      case 'open': list = list.filter(r => r.status === 'open'); break;
      case 'assigned': list = list.filter(r => r.status === 'assigned'); break;
      case 'emergency': list = list.filter(r => r.isEmergency); break;
      case 'completed': list = list.filter(r => r.status === 'completed'); break;
      case 'cancelled': list = list.filter(r => r.status === 'cancelled'); break;
    }

    const term = this.searchTerm.trim().toLowerCase();
    if (term) {
      list = list.filter(r =>
        r.title?.toLowerCase().includes(term) ||
        r.customerName?.toLowerCase().includes(term) ||
        `r${r.id}`.toLowerCase().includes(term)
      );
    }

    return list;
  }

  // ── Helpers ─────────────────────────────────────────────────────
  statusLabel(status: string): string {
    const map: Record<string, string> = {
      open: 'مفتوح للعروض',
      assigned: 'قيد التنفيذ',
      completed: 'مكتمل',
      cancelled: 'ملغي',
    };
    return map[status] || status;
  }

  statusColor(status: string): string {
    const map: Record<string, string> = {
      open: '#e8f4ff',
      assigned: '#fef3c7',
      completed: '#e8fdf2',
      cancelled: '#fde8e8',
    };
    return map[status] || '#f0f4f8';
  }

  statusTextColor(status: string): string {
    const map: Record<string, string> = {
      open: '#1787e0',
      assigned: '#d97706',
      completed: '#1a7a47',
      cancelled: '#ef4444',
    };
    return map[status] || '#64748b';
  }

  urgencyLabel(urgency: string): string {
    const map: Record<string, string> = {
      low: 'عادي',
      medium: 'متوسط',
      high: 'عاجل',
    };
    return map[urgency] || urgency;
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

  toInputDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toISOString().slice(0, 16);
  }

  // ── AI Price Display Helpers ───────────────────────────────────────────
  hasAiPrice(request: { aiPriceMin?: number; aiPriceMax?: number } | null | undefined): boolean {
    return !!(request?.aiPriceMin && request?.aiPriceMax);
  }

  formatPriceRange(request: { aiPriceMin?: number; aiPriceMax?: number }): string {
    if (!this.hasAiPrice(request)) return 'غير محدد';
    return `${request.aiPriceMin} — ${request.aiPriceMax} ج.م`;
  }

  getAiPriceRange(): string {
    if (!this.viewRequest) return 'غير محدد';
    if (!this.hasAiPrice(this.viewRequest)) return 'غير محدد';
    return `${this.viewRequest.aiPriceMin} — ${this.viewRequest.aiPriceMax} ج.م`;
  }

  // ── VIEW ─────────────────────────────────────────────────────────
  onView(request: Request) {
    this.showViewModal = true;
    this.viewLoading = true;
    this.viewRequest = null;

    this.requestService.getRequestById(request.id).subscribe({
      next: (data: RequestDetail) => {
        this.viewRequest = data;
        this.viewLoading = false;
      },
      error: () => {
        this.viewLoading = false;
      }
    });
  }

  closeViewModal() {
    this.showViewModal = false;
    this.viewRequest = null;
  }

  // ── EDIT ─────────────────────────────────────────────────────────
  onEdit(request: Request) {
    this.showEditModal = true;
    this.editErrorMsg = '';
    this.editLoading = true;
    this.editId = request.id;

    this.requestService.getRequestById(request.id).subscribe({
      next: (data: RequestDetail) => {
        this.editTitle = data.title || '';
        this.editDescription = data.description || '';
        this.editScheduledAt = this.toInputDate(data.scheduledAt);
        this.editLoading = false;
      },
      error: () => {
        this.editTitle = request.title || '';
        this.editDescription = '';
        this.editScheduledAt = this.toInputDate(request.scheduledAt);
        this.editLoading = false;
      }
    });
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editId = null;
  }

  onSaveEdit() {
    if (!this.editId) return;

    if (!this.editTitle) {
      this.editErrorMsg = 'عنوان الطلب مطلوب';
      return;
    }

    this.editSaving = true;
    this.editErrorMsg = '';

    const body = {
      title: this.editTitle,
      description: this.editDescription,
      scheduledAt: this.editScheduledAt ? new Date(this.editScheduledAt).toISOString() : null,
    };

    this.http.put(`${this.apiUrl}/requests/${this.editId}`, body, { headers: this.authHeaders() }).subscribe({
      next: () => {
        this.editSaving = false;
        this.closeEditModal();
        this.loadRequests();
      },
      error: (err: any) => {
        this.editSaving = false;
        this.editErrorMsg = err.error?.message || 'حدث خطأ أثناء حفظ التعديلات';
      }
    });
  }

  // ── DELETE ───────────────────────────────────────────────────────
  onDelete(request: Request) {
    this.showDeleteModal = true;
    this.deleteRequest = request;
    this.deleteErrorMsg = '';
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.deleteRequest = null;
  }

  confirmDelete() {
    if (!this.deleteRequest) return;

    this.deleting = true;
    this.deleteErrorMsg = '';

    this.http.delete(`${this.apiUrl}/requests/${this.deleteRequest.id}`, { headers: this.authHeaders() }).subscribe({
      next: () => {
        this.deleting = false;
        this.requests = this.requests.filter(r => r.id !== this.deleteRequest!.id);
        this.closeDeleteModal();
      },
      error: (err: any) => {
        this.deleting = false;
        if (err.status === 500) {
          this.deleteErrorMsg = 'لا يمكن حذف هذا الطلب لارتباطه ببيانات أخرى. يرجى التواصل مع فريق التطوير.';
        } else {
          this.deleteErrorMsg = err.error?.message || 'حدث خطأ أثناء حذف الطلب';
        }
      }
    });
  }
}