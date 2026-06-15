import { Component, Input, OnChanges } from '@angular/core';
import { ChatMessage, Conversation } from '../../../models/chat-message.model';
import { ChatSignalRService } from '../../../services/chat-signalr';
import { ChatApi } from '../../../services/chat-api';
import { MessageBuddle } from "../message-buddle/message-buddle";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-window',
  imports: [MessageBuddle,FormsModule,CommonModule],
  templateUrl: './chat-window.html',
  styleUrl: './chat-window.css',
})
export class ChatWindow implements OnChanges {
  @Input() conversation!: Conversation;
  @Input() messages: ChatMessage[] = [];

  newMessage = '';
  isTyping = false;

  constructor(
    private signalR: ChatSignalRService,
    private chatApi: ChatApi
  ) {}

  ngOnChanges() {
    if (this.conversation) {
      this.signalR.userTyping$.subscribe(data => {
        const requestId = typeof data === 'number' ? data : data.requestId;
        if (requestId === this.conversation.requestId) {
          this.isTyping = true;
          setTimeout(() => this.isTyping = false, 2000);
        }
      });
    }
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;


    this.signalR.sendTextMessage(this.conversation.requestId, this.newMessage);
    this.newMessage = '';
  }

  onTyping() {
    this.signalR.sendTyping(this.conversation.requestId);
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.chatApi.uploadFile(this.conversation.requestId, file, 'Image').subscribe();
  }
}
