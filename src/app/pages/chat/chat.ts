import { Component, OnInit } from '@angular/core';
import { ChatMessage, Conversation } from '../../models/chat-message.model';
import { ChatApi } from '../../services/chat-api';
import { ChatSingnalr } from '../../services/chat-singnalr';
import { ConversationList } from "./conversation-list/conversation-list";
import { ChatWindow } from "./chat-window/chat-window";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat',
  imports: [ConversationList, ChatWindow, FormsModule,CommonModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat implements OnInit{

  conversations: Conversation[] = [];
selectedConversation: Conversation | null = null;
messages: ChatMessage[] = [];

  constructor(private chatApi: ChatApi, private signalr:ChatSingnalr){}

  ngOnInit() {


      //mock data
// this.conversations = [
//     {
//       requestId: 1,
//       otherUserName: 'م. أحمد فاروق',
//       otherUserAvatar: '',
//       lastMessage: 'هكون عندك خلال ساعة',
//       lastMessageTime: '٤:٣٢',
//       unreadCount: 2
//     },
//     {
//       requestId: 2,
//       otherUserName: 'م. محمد سعيد',
//       otherUserAvatar: '',
//       lastMessage: 'تم استلام الطلب',
//       lastMessageTime: '١:٣٠',
//       unreadCount: 0
//     }
//   ];


    const token = localStorage.getItem('token') ?? '';
    this.signalr.connect(token).then(() => {
      this.signalr.messageReceived$.subscribe(msg => {
        if (msg.isMine != undefined) this.messages.push(msg);
      });
    });
    this.loadConversation();
  }

  loadConversation() {
  this.chatApi.getConversation().subscribe({
    next: data => this.conversations = data,
    error: err => console.error('Failed to load conversations:', err)
  });
}

  onSelectConversation(conv: Conversation) {
  this.selectedConversation = conv;
  this.signalr.joinRequest(conv.requestId);
  this.chatApi.getMessage(conv.requestId).subscribe({
    next: data => {
      this.messages = data;
      this.chatApi.markAsRead(conv.requestId).subscribe();
    },
    error: err => console.error('Failed to load messages:', err)
  });
}
}
