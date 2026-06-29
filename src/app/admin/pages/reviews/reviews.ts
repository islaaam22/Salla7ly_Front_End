import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Auth } from '../../../services/auth';

interface Review {
  id: number;
  requestId: number;
  reviewerId: string;
  reviewerName: string;
  revieweeId: string;
  revieweeName: string;
  qualityScore: number;
  punctualityScore: number;
  communicationScore: number;
  valueScore: number;
  overallScore: number;
  comment: string;
  technicianReply: string | null;
  createdAt: string;
  // TODO: add when backend returns it:
  // isFlagged: boolean;
  // moderationNote: string;
  isFlagged?: boolean; // local-only flag until backend supports it
}

type FilterTab = 'all' | 'flagged' | 'clean';

@Component({
  selector: 'app-admin-reviews',
  imports: [CommonModule, FormsModule],
  templateUrl: './reviews.html',
  styleUrl: './reviews.css',
})
export class AdminReviews implements OnInit {
  private apiUrl = 'https://sala7ly.runasp.net/api';

  loading = true;
  errorMsg = '';

  reviews: Review[] = [];
  searchTerm = '';
  activeTab: FilterTab = 'all';

  // ── Edit/Moderate modal ───────────────────────────────────────
  showEditModal = false;
  editSaving = false;
  editErrorMsg = '';
  editReview: Review | null = null;
  editComment = '';
  editModerationNote = '';
  editRating = 0;
  hoverRating = 0;

  // ── Delete modal ──────────────────────────────────────────────
  showDeleteModal = false;
  deleteReview: Review | null = null;
  deleting = false;
  deleteErrorMsg = '';

  // ── Flag loading ──────────────────────────────────────────────
  flagLoadingId: number | null = null;

  constructor(private http: HttpClient, private authService: Auth) {}

  ngOnInit() {
    this.loadReviews();
  }

  private authHeaders(): HttpHeaders {
    let token = this.authService.getToken() || '';
    if (token.startsWith('Bearer ')) token = token.substring(7);
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  loadReviews() {
    this.loading = true;
    this.errorMsg = '';

    this.http.get<Review[]>(`${this.apiUrl}/Review`, { headers: this.authHeaders() }).subscribe({
      next: (data) => {
        this.reviews = (data || []).map(r => ({ ...r, isFlagged: false }));
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        if (err.status === 401 || err.status === 403) {
          this.errorMsg = 'غير مصرح لك بالوصول لهذه البيانات';
        } else {
          this.errorMsg = 'تعذّر تحميل التقييمات';
        }
      }
    });
  }

  // ── Tab counts ──────────────────────────────────────────────────
  get countAll(): number { return this.reviews.length; }
  get countFlagged(): number { return this.reviews.filter(r => r.isFlagged).length; }
  get countClean(): number { return this.reviews.filter(r => !r.isFlagged).length; }

  setTab(tab: FilterTab) {
    this.activeTab = tab;
  }

  // ── Filtered list ───────────────────────────────────────────────
  get filteredReviews(): Review[] {
    let list = this.reviews;

    switch (this.activeTab) {
      case 'flagged': list = list.filter(r => r.isFlagged); break;
      case 'clean': list = list.filter(r => !r.isFlagged); break;
    }

    const term = this.searchTerm.trim().toLowerCase();
    if (term) {
      list = list.filter(r =>
        r.reviewerName?.toLowerCase().includes(term) ||
        r.revieweeName?.toLowerCase().includes(term) ||
        r.comment?.toLowerCase().includes(term)
      );
    }

    return list;
  }

  // ── Helpers ─────────────────────────────────────────────────────
  starsArray(score: number): boolean[] {
    return [1, 2, 3, 4, 5].map(i => i <= Math.round(score));
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
  }

  // ── FLAG (report as inappropriate) ──────────────────────────────
  onToggleFlag(review: Review) {
    this.flagLoadingId = review.id;

    const body = {
      reviewId: review.id,
      comment: review.comment,
      moderationNote: review.isFlagged ? '' : 'تم الإبلاغ عن هذا التقييم كمحتوى مخالف',
    };

    this.http.put<any>(`${this.apiUrl}/Review/moderate`, body, { headers: this.authHeaders() }).subscribe({
      next: () => {
        this.flagLoadingId = null;
        review.isFlagged = !review.isFlagged;
      },
      error: (err: any) => {
        this.flagLoadingId = null;
        console.error('Flag error', err);
      }
    });
  }

  // ── EDIT (moderate) ──────────────────────────────────────────────
  onEdit(review: Review) {
    this.showEditModal = true;
    this.editErrorMsg = '';
    this.editReview = review;
    this.editComment = review.comment || '';
    this.editModerationNote = '';
    this.editRating = Math.round(review.overallScore);
    this.hoverRating = 0;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editReview = null;
    this.hoverRating = 0;
  }

  setRating(star: number) {
    this.editRating = star;
  }

  onSaveEdit() {
    if (!this.editReview) return;

    this.editSaving = true;
    this.editErrorMsg = '';

    const body = {
      reviewId: this.editReview.id,
      comment: this.editComment,
      moderationNote: this.editModerationNote,
      // TODO: add rating field once backend supports updating it via moderate endpoint
    };

    this.http.put<any>(`${this.apiUrl}/Review/moderate`, body, { headers: this.authHeaders() }).subscribe({
      next: () => {
        this.editSaving = false;
        // Update locally
        if (this.editReview) {
          this.editReview.comment = this.editComment;
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
  onDelete(review: Review) {
    this.showDeleteModal = true;
    this.deleteReview = review;
    this.deleteErrorMsg = '';
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.deleteReview = null;
  }

  confirmDelete() {
    if (!this.deleteReview) return;

    this.deleting = true;
    this.deleteErrorMsg = '';

    this.http.delete(`${this.apiUrl}/Review/${this.deleteReview.id}`, { headers: this.authHeaders() }).subscribe({
      next: () => {
        this.deleting = false;
        this.reviews = this.reviews.filter(r => r.id !== this.deleteReview!.id);
        this.closeDeleteModal();
      },
      error: (err: any) => {
        this.deleting = false;
        if (err.status === 500) {
          this.deleteErrorMsg = 'لا يمكن حذف هذا التقييم لارتباطه ببيانات أخرى';
        } else {
          this.deleteErrorMsg = err.error?.message || 'حدث خطأ أثناء حذف التقييم';
        }
      }
    });
  }
}