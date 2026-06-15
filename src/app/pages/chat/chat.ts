// chat/chat.component.ts
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ChatApi } from '../../services/chat-api';
import { ChatSignalRService } from '../../services/chat-signalr';
import { ChatMessage, Conversation } from '../../models/chat-message.model';
import { MessageBuddle } from './message-buddle/message-buddle';
import { FormsModule } from '@angular/forms';
import { ChatWindow } from './chat-window/chat-window';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.html',
  imports: [CommonModule, FormsModule],
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  conversations: Conversation[] = [];
  messages: ChatMessage[] = [];
  selectedRequestId: number | null = null;
  messageText = '';
  isTyping = false;
  isLoading = false;
  currentPage = 1;

  private typingTimeout: any;
  private subscriptions = new Subscription();

  constructor(
    private chatApi: ChatApi,
    private chatHub: ChatSignalRService,
    private route: ActivatedRoute,
  ) {}

async ngOnInit() {
  const token = localStorage.getItem('token')!;

  this.subscriptions.unsubscribe();
  this.subscriptions = new Subscription();

  if (!this.chatHub.isConnected) {
    await this.chatHub.connect(token);
  }

  this.subscriptions.add(
    this.chatHub.receiveMessage$.subscribe((msg) => this.onReceiveMessage(msg))
  );
  this.subscriptions.add(
    this.chatHub.userTyping$.subscribe((data) => this.onUserTyping(data))
  );
  this.subscriptions.add(
    this.chatHub.messagesRead$.subscribe((data) => this.onMessagesRead(data))
  );
  this.subscriptions.add(
    this.chatHub.error$.subscribe((err) => console.error('Chat error:', err))
  );

  const requestedChatIdString = this.route.snapshot.paramMap.get('id');
  const requestedChatId = requestedChatIdString ? Number(requestedChatIdString) : null;
  this.chatApi.getConversation().subscribe((list) => {
    this.conversations = list;
    if (requestedChatId) {
      this.openConversation(requestedChatId);
    }
  });
}
  async openConversation(requestId: number) {
    if (this.selectedRequestId) {
      await this.chatHub.leaveRequest(this.selectedRequestId);
    }

    this.selectedRequestId = requestId;
    this.messages = [];
    this.currentPage = 1;
    this.isLoading = true;

    // Load history via REST
    this.chatApi.getMessage(requestId).subscribe((messages) => {
      this.messages = messages.reverse(); // oldest first
      this.isLoading = false;
      this.scrollToBottom();
    });

    // Join room + mark read via SignalR
    await this.chatHub.joinRequest(requestId);
    await this.chatHub.markRead(requestId);

    this.conversations = this.conversations.map((c) =>
      c.requestId === requestId ? { ...c, unreadCount: 0 } : c,
    );
  }

  getSelectedConversation(): Conversation | undefined {
    return this.conversations.find((c) => c.requestId === this.selectedRequestId);
  }

  loadMoreMessages() {
    if (!this.selectedRequestId) return;

    this.currentPage++;
    this.chatApi.getMessage(this.selectedRequestId, this.currentPage).subscribe((older) => {
      this.messages = [...older.reverse(), ...this.messages];
    });
  }

  sendImage(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !this.selectedRequestId) return;

    // REST upload â€” server broadcasts via SignalR automatically
    this.chatApi.uploadFile(this.selectedRequestId, file, 'Image').subscribe();
  }

  async sendMessage() {
    if (!this.messageText.trim() || !this.selectedRequestId) return;
    const text = this.messageText.trim();
    this.messageText ='';
    await this.chatHub.sendTextMessage(this.selectedRequestId, text);
  }

  onTyping() {
    if (!this.selectedRequestId) return;

    clearTimeout(this.typingTimeout);
    this.chatHub.sendTyping(this.selectedRequestId);
  }

  // â”€â”€ Event handlers

  private onReceiveMessage(message: ChatMessage) {
    console.log('reciev: ', message.id, message.content)
  if (message.requestId === this.selectedRequestId) {
    this.messages = [...this.messages, message];
    this.scrollToBottom();
  }

  this.conversations = this.conversations.map(c =>
    c.requestId === message.requestId
      ? {
          ...c,
          lastMessage: message.content ?? (message.messageType === 1 ? 'صورة' : 'رسالة صوتية'),
          lastMessageTime: message.sentAt,
          unreadCount: message.requestId === this.selectedRequestId
            ? c.unreadCount
            : c.unreadCount + 1
        }
      : c
  );
}
private typingHideTimeout: any;

private onUserTyping(data: { userId: string; requestId: number }) {
  if (data.requestId !== this.selectedRequestId) return;

  this.isTyping = true;
  clearTimeout(this.typingHideTimeout);
  this.typingHideTimeout = setTimeout(() => (this.isTyping = false), 2000);
}

  private onMessagesRead(data: { requestId: number; readBy: string }) {
    if (data.requestId === this.selectedRequestId) {
      this.messages = this.messages.map((m) => ({ ...m, isRead: true }));
    }
  }

  isMyMessage(message: ChatMessage): boolean {
    const myId = localStorage.getItem('userId');
    return message.senderId === myId;
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
      }
    }, 50);
  }

  async ngOnDestroy() {
    if (this.selectedRequestId) {
      await this.chatHub.leaveRequest(this.selectedRequestId);
    }
    await this.chatHub.disconnect();
    this.subscriptions.unsubscribe();
  }
}
