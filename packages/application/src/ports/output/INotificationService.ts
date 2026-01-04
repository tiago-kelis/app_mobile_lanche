export interface NotificationData {
  userId?: string;
  userIds?: string[];
  broadcast?: boolean;
  broadcastToAdmins?: boolean;
  title: string;
  message: string;
  data?: any;
  type: 'order_status' | 'new_order' | 'fresh_food' | 'food_availability' | 'general';
  priority: 'low' | 'normal' | 'high';
}

export interface INotificationService {
  send(notification: NotificationData): Promise<void>;
  sendToUser(userId: string, notification: Omit<NotificationData, 'userId'>): Promise<void>;
  sendToAdmins(notification: Omit<NotificationData, 'broadcastToAdmins'>): Promise<void>;
  broadcast(notification: Omit<NotificationData, 'broadcast'>): Promise<void>;
}