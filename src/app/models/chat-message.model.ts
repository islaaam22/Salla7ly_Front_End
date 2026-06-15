export interface Conversation{
  requestId: number;
  otherPartyName: string;
  otherPartyrImage:string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}



export interface ChatMessage {
  id: number;
  requestId: number;
  senderId: string;
  senderName: string;
  content: string | null;
  attachmentUrls: string[] | null;
  messageType:  0 | 1 | 2;
  durationSeconds: number | null;
  isRead: boolean;
  readAt: string | null;
  sentAt: string;
}