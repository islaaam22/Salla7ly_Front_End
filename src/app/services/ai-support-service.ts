import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AiChatMessage } from '../models/ai-support-model';

@Injectable({ providedIn: 'root' })
export class AiSupportService {
 private apiUrl = 'https://sala7ly.runasp.net/api/ai-support/ask';
  constructor(private http: HttpClient) {}

  ask(message: string, history: AiChatMessage[]): Observable<{ reply: string }> {
    return this.http.post<{ reply: string }>(this.apiUrl, { message, history });
  }
}