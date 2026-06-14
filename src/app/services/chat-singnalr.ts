import { Injectable, Signal } from '@angular/core';
import { Subject } from 'rxjs';
import { ChatMessage } from '../models/chat-message.model';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root',
})
export class ChatSingnalr {

  private hubUrl = 'https://sala7ly.runasp.net/chatHub';
  private hub!: signalR.HubConnection;

  messageReceived$ = new Subject<ChatMessage>();
  userTyping$ = new Subject<number>();
  messagesRead$ = new Subject<number>();

  connect(token: string): Promise<void> {
    this.hub = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl, { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .build();

    this.hub.on('ReceiveMessage', (msg: ChatMessage) => this.messageReceived$.next(msg));
    this.hub.on('UserTyping', (requestId: number) => this.userTyping$.next(requestId));
    this.hub.on('MessagesRead', (requestId: number) => this.messagesRead$.next(requestId));

    return this.hub.start();
  }

  joinRequest(requestId: number) {
    this.hub.invoke('JoinRequest', requestId);
  }

  sendTextMessage(requestId: number, content: string) {
    this.hub.invoke('SendTextMessage', requestId, content);
  }

  sendTyping(requestId: number) {
    this.hub.invoke('Typing', requestId);
  }

  markRead(requestId: number) {
    this.hub.invoke('MarkRead', requestId);
  }
}
