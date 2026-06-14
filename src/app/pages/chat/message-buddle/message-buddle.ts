import { Component, Input } from '@angular/core';
import { ChatMessage } from '../../../models/chat-message.model';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-message-buddle',
  imports: [DatePipe,CommonModule],
  templateUrl: './message-buddle.html',
  styleUrl: './message-buddle.css',
})
export class MessageBuddle {
  @Input() message!: ChatMessage;
}
