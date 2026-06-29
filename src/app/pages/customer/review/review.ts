import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { RequestService } from '../../../services/request';
import { ReviewService, SubmitReviewDto } from '../../../services/review-service';

@Component({
  selector: 'app-review',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './review.html',
  styleUrl: './review.css'
})
export class Review implements OnInit {
  requestId = 0;

  // Request meta shown in the header
  requestTitle    = '';
  technicianName  = '';

  // Page states
  pageLoading     = true;
  alreadyReviewed = false;
  submitLoading   = false;

  successMsg = '';
  errorMsg   = '';

  /**
   * All five rating fields default to 1 so the form is always valid even if
   * the customer only touches "overall". The customer can raise individual
   * scores with the star rows; overall is the only one visually marked required.
   */
  ratings = {
    overall:       0,
    quality:       1,
    communication: 1,
    punctuality:   1,
    value:         1,
  };

  comment = '';
  stars   = [1, 2, 3, 4, 5];

  constructor(
    private route:          ActivatedRoute,
    private router:         Router,
    private requestService: RequestService,
    private reviewService:  ReviewService
  ) {}

  ngOnInit() {
    this.requestId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadPageData();
  }

  // ─── Data loading ─────────────────────────────────────────────────────────

  private loadPageData() {
    this.pageLoading = true;

    this.requestService.getRequestById(this.requestId).subscribe({
      next: (req) => {
        this.requestTitle  = req.title          ?? '';
        this.technicianName = req.technicianName ?? '';
        this.checkExistingReview();
      },
      error: () => {
        // Non-fatal — form can still be submitted without the header info
        this.checkExistingReview();
      }
    });
  }

  private checkExistingReview() {
    this.reviewService.getReviewByRequest(this.requestId).subscribe({
      next: (existing) => {
        if (existing?.id) {
          // Pre-fill and lock the form so the customer can see their past rating
          this.alreadyReviewed        = true;
          this.ratings.overall        = existing.overallRating ?? existing.overallScore ?? existing.rating ?? 0;
          this.ratings.quality        = existing.qualityScore       ?? 1;
          this.ratings.communication  = existing.communicationScore ?? 1;
          this.ratings.punctuality    = existing.punctualityScore   ?? 1;
          this.ratings.value          = existing.valueScore         ?? 1;
          this.comment                = existing.comment            ?? '';
        }
        this.pageLoading = false;
      },
      error: () => {
        // 404 = no review yet — expected, keep form open
        this.pageLoading = false;
      }
    });
  }

  // ─── Star interaction ────────────────────────────────────────────────────

  setRating(field: keyof typeof this.ratings, value: number) {
    if (this.alreadyReviewed) return;
    this.ratings[field] = value;
  }

  // ─── Navigation ──────────────────────────────────────────────────────────

  goToMyRequests() {
    this.router.navigate(['/customer/my-requests']);
  }

  // ─── Submission ──────────────────────────────────────────────────────────

  onSubmit() {
    if (this.alreadyReviewed || this.submitLoading) return;

    if (this.ratings.overall === 0) {
      this.errorMsg = 'الرجاء اختيار التقييم العام على الأقل.';
      return;
    }

    this.submitLoading = true;
    this.errorMsg      = '';
    this.successMsg    = '';

    // Use the overall rating as fallback for any sub-score the customer left
    // at its default of 1, so the result feels intentional. This also ensures
    // every score is always in the required 1-5 range.
    const overall = this.ratings.overall;

    const dto: SubmitReviewDto = {
      requestId:          this.requestId,
      overallRating:      overall,
      qualityScore:       this.ratings.quality        > 1 ? this.ratings.quality        : overall,
      communicationScore: this.ratings.communication  > 1 ? this.ratings.communication  : overall,
      punctualityScore:   this.ratings.punctuality    > 1 ? this.ratings.punctuality    : overall,
      valueScore:         this.ratings.value          > 1 ? this.ratings.value          : overall,
      comment:            this.comment.trim() || undefined
    };

    this.reviewService.submitReview(dto).subscribe({
      next: () => {
        this.submitLoading   = false;
        this.alreadyReviewed = true;
        this.successMsg      = 'تم إرسال تقييمك بنجاح! شكراً لك.';
        setTimeout(() => this.goToMyRequests(), 2000);
      },
      error: (err) => {
        this.submitLoading = false;
        // Surface the first field-level validation error if present
        const fieldErrors = err?.error?.errors;
        if (fieldErrors) {
          const firstKey   = Object.keys(fieldErrors)[0];
          this.errorMsg    = fieldErrors[firstKey]?.[0] ?? 'حدث خطأ في التحقق من البيانات.';
        } else {
          this.errorMsg =
            err?.error?.message ??
            err?.error?.title   ??
            'حدث خطأ أثناء إرسال التقييم. يرجى المحاولة مرة أخرى.';
        }
      }
    });
  }
}
