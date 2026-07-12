import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FollowupResponse {
  question: string;
}

export interface RefineResponse {
  refinedDescription: string;
  // TODO: adjust field name if backend returns different key
}

export interface ImageAnalysisResponse {
  detectedProblem: string;
  category: string;
  severity: string;
  affectedComponents: string[];
  suggestedDescription: string;
  confidence: number;
  latencyMs: number;
}

export interface PriceEstimationResponse {
  minPrice: number;
  maxPrice: number;
  fairPrice: number;
  priceFactors: string[];
  confidence: number;
}

@Injectable({ providedIn: 'root' })
export class AiService {
  private apiUrl = 'https://sala7ly.runasp.net/api';

  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders {
    let token = localStorage.getItem('token') || '';
    if (token.startsWith('Bearer ')) token = token.substring(7);
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  askFollowup(rawDescription: string, previousAnswers: string[], categories: string[]): Observable<FollowupResponse> {
    const body = { rawDescription, previousAnswers, categories };
    return this.http.post<FollowupResponse>(`${this.apiUrl}/ai/ask-followup`, body, { headers: this.authHeaders() });
  }

  refineRequest(rawDescription: string, categoryHint: string, categories: string[], allAnswers: string[]): Observable<RefineResponse> {
    const body = { rawDescription, categoryHint, categories, allAnswers };
    return this.http.post<RefineResponse>(`${this.apiUrl}/ai/refine-request`, body, { headers: this.authHeaders() });
  }

  // ── Image Analysis ───────────────────────────────────────────────────────

  /**
   * Analyze a base64 encoded image
   */
  analyzeImage(base64Image: string, mediaType: string = 'image/jpeg'): Observable<ImageAnalysisResponse> {
    const formData = new FormData();
    formData.append('image', this.base64ToBlob(base64Image, mediaType));

    return this.http.post<ImageAnalysisResponse>(
      `${this.apiUrl}/ai/analyze-image`,
      formData,
      {
        headers: this.authHeaders().delete('Content-Type'), // Let browser set multipart boundary
      }
    );
  }

  /**
   * Analyze an uploaded file directly
   */
  analyzeImageUpload(file: File): Observable<ImageAnalysisResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ImageAnalysisResponse>(
      `${this.apiUrl}/ai/analyze-image/upload`,
      formData,
      {
        headers: this.authHeaders().delete('Content-Type'),
      }
    );
  }

  /**
   * Analyze images already attached to a request
   */
  analyzeRequestImages(requestId: number, imageUrls: string[]): Observable<ImageAnalysisResponse> {
    return this.http.post<ImageAnalysisResponse>(
      `${this.apiUrl}/ai/analyze-request-images/${requestId}`,
      { imageUrls: imageUrls },
      { headers: this.authHeaders() }
    );
  }

  // ── Price Estimation ─────────────────────────────────────────────────────

  /**
   * Get AI price estimation for a request
   */
  estimatePrice(requestId: number): Observable<PriceEstimationResponse> {
    return this.http.post<PriceEstimationResponse>(
      `${this.apiUrl}/ai/price-estimate/${requestId}`,
      {},
      { headers: this.authHeaders() }
    );
  }

  // ── Helper Methods ───────────────────────────────────────────────────────

  /**
   * Convert base64 string to Blob for FormData
   */
  private base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }
}