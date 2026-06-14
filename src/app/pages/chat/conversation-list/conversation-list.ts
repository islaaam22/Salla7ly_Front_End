import { Component, EventEmitter, Input, input, Output } from '@angular/core';
import { Conversation } from '../../../models/chat-message.model';
import { CommonModule, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-conversation-list',
  imports: [CommonModule],
  templateUrl: './conversation-list.html',
  styleUrl: './conversation-list.css',
})
export class ConversationList {
  @Input() conversation: Conversation[] = [];
  @Output() conversationSelected = new EventEmitter<Conversation>();
}
