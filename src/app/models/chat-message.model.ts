export interface Conversation{
  requestId: number;
  otherUserName: string;
  otherUserAvatar:string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface ChatMessage{
  id: number;
  senderId: string;
  senderName: string;
  content: string;
  messageType: 'text' | 'image' | 'voice';
  fileUrl? : string;
  sentAt : string;
  isRead: boolean;
  isMine: boolean;
}
