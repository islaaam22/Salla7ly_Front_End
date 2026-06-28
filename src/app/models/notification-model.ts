export interface AppNotification {
  id: number;
  type: string;
  title: string;
  body: string;
  deepLink: string | null;
  isRead: boolean;
  sentAt: string;
}