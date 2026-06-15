
// services/chat-signalr.service.ts
import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject, Observable } from 'rxjs';
import { ChatMessage } from '../models/chat-message.model';

@Injectable({ providedIn: 'root' })
export class ChatSignalRService {
  private readonly hubUrl = 'https://sala7ly.runasp.net/chathub';
  private connection!: signalR.HubConnection;

  // Event streams
  private receiveMessageSubject = new Subject<ChatMessage>();
  private userTypingSubject     = new Subject<{ userId: string; requestId: number }>();
  private messagesReadSubject   = new Subject<{ requestId: number; readBy: string }>();
  private joinedSubject         = new Subject<number>();
  private errorSubject          = new Subject<string>();

  receiveMessage$ = this.receiveMessageSubject.asObservable();
  userTyping$     = this.userTypingSubject.asObservable();
  messagesRead$   = this.messagesReadSubject.asObservable();
  joined$         = this.joinedSubject.asObservable();
  error$          = this.errorSubject.asObservable();

  get isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }

  // ── Connection lifecycle ──────────────────────────────────────────────────

  connect(token: string): Promise<void> {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        accessTokenFactory: () => token,
        transport: signalR.HttpTransportType.LongPolling
      })
      .withAutomaticReconnect()
      .build();

    this.registerHandlers();

    return this.connection.start();
  }

  disconnect(): Promise<void> {
    return this.connection?.stop();
  }

  private registerHandlers(): void {
  this.connection.off('ReceiveMessage');
  this.connection.off('UserTyping');
  this.connection.off('MessagesRead');
  this.connection.off('Joined');
  this.connection.off('Error');

  this.connection.on('ReceiveMessage', (message: ChatMessage) => {
    this.receiveMessageSubject.next(message);
  });
  this.connection.on('UserTyping', (data: { userId: string; requestId: number }) => {
    this.userTypingSubject.next(data);
  });
  this.connection.on('MessagesRead', (data: { requestId: number; readBy: string }) => {
    this.messagesReadSubject.next(data);
  });
  this.connection.on('Joined', (requestId: number) => {
    this.joinedSubject.next(requestId);
  });
  this.connection.on('Error', (error: string) => {
    this.errorSubject.next(error);
  });
}

  // ── Invoke methods ────────────────────────────────────────────────────────

  joinRequest(requestId: number): Promise<void> {
    return this.connection.invoke('JoinRequest', requestId);
  }

  leaveRequest(requestId: number): Promise<void> {
    return this.connection.invoke('LeaveRequest', requestId);
  }

  sendTextMessage(requestId: number, content: string): Promise<void> {
    return this.connection.invoke('SendTextMessage', requestId, content);
  }

  sendTyping(requestId: number): Promise<void> {
    return this.connection.invoke('Typing', requestId);
  }

  markRead(requestId: number): Promise<void> {
    return this.connection.invoke('MarkRead', requestId);
  }
}