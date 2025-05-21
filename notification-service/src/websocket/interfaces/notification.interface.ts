export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  link?: string;
  data?: any;
}

export interface NotificationPayload {
  userId: string;
  hotelId: string;
  notification: Notification;
}