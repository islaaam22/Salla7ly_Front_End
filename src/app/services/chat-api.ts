import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChatMessage, Conversation } from '../models/chat-message.model';

@Injectable({
  providedIn: 'root',
})

export class ChatApi {

  
  private apiUrl = 'https://sala7ly.runasp.net/api/chat';

private getHeaders() {
  const token = localStorage.getItem('token') ?? '';
  return { headers: { Authorization: `Bearer ${token}` } };
}

  constructor(private http: HttpClient) {}

  getConversation(): Observable<Conversation[]> {
    return this.http.get<Conversation[]> (`${this.apiUrl}/conversations`, this.getHeaders());
  }

  getMessage(requestId: number, page = 1, pageSize = 30): Observable<ChatMessage[]>
  {
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/${requestId}?page=${page}&pageSize=${pageSize}`,this.getHeaders())
  }

  markAsRead(requestId: number): Observable<void>
  {
    return this.http.post<void>(`${this.apiUrl}/${requestId}/read`, {},this.getHeaders())
  }

  uploadFile(requestId: number, file: File, type: 'Image' | 'Voice', durationSeconds?: number): Observable<ChatMessage> {
    const formData = new FormData();
    formData.append('MessageType', type);
    formData.append('files', file);
    formData.append('requestId', requestId.toString());
    if(durationSeconds)
    {
      formData.append('DurationSeconds', durationSeconds.toString());
    }
    return this.http.post<ChatMessage>(`${this.apiUrl}/upload`, formData, this.getHeaders());
  }
}
