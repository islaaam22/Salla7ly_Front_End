import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/** Payload sent to POST /api/Review — field names match backend validation exactly */
export interface SubmitReviewDto {
  requestId:          number;
  overallRating:      number;   // 1-5
  qualityScore:       number;   // 1-5  (backend: QualityScore)
  communicationScore: number;   // 1-5  (backend: CommunicationScore)
  punctualityScore:   number;   // 1-5  (backend: PunctualityScore)
  valueScore:         number;   // 1-5  (backend: ValueScore)
  comment?:           string;
}

/**
 * Shape returned by GET /api/Review/request/{requestId}
 * The overall score may come back under different field names depending on
 * the backend serialisation — we accept all known variants.
 */
export interface ReviewResponse {
  id:                  number;
  requestId?:          number;
  // Overall — backend may return any of these names
  overallRating?:      number;
  overallScore?:       number;
  rating?:             number;
  // Sub-scores
  qualityScore?:       number;
  communicationScore?: number;
  punctualityScore?:   number;
  valueScore?:         number;
  comment?:            string;
  customerName?:       string;
  createdAt?:          string;
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly apiUrl = 'https://sala7ly.runasp.net/api';

  constructor(private http: HttpClient) {}

  /**
   * POST /api/Review
   * Auth token is attached automatically by the auth interceptor.
   */
  submitReview(dto: SubmitReviewDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/Review`, dto);
  }

  /**
   * GET /api/Review/request/{requestId}
   * Returns 404 when no review exists yet — the component handles that in the
   * error callback and simply keeps the form open.
   */
  getReviewByRequest(requestId: number): Observable<ReviewResponse> {
    return this.http.get<ReviewResponse>(
      `${this.apiUrl}/Review/request/${requestId}`
    );
  }
}
