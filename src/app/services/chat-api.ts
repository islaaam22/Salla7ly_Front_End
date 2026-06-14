import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChatMessage, Conversation } from '../models/chat-message.model';

@Injectable({
  providedIn: 'root',
})

export class ChatApi {

  private apiUrl = 'https://sala7ly.runasp.net/api';

  constructor(private http: HttpClient) {}

  getConversation(): Observable<Conversation[]> {
    return this.http.get<Conversation[]> (`${this.apiUrl}/chat/conversation`);
  }

  getMessage(requestId: number, page = 1, pageSize = 30): Observable<ChatMessage[]>
  {
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/${requestId}?page=${page}&pageSize=${pageSize}`)
  }

  markAsRead(requestId: number): Observable<void>
  {
    return this.http.post<void>(`${this.apiUrl}/${requestId}/read`, {})
  }

  uploadFile(requestId: number, file: File): Observable<{ fileUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('requestId', requestId.toString());
    return this.http.post<{ fileUrl: string }>(`${this.apiUrl}/upload`, formData);
  }
}
