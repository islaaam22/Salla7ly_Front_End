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
}