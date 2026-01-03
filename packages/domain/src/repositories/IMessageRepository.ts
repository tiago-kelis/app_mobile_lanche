import { Message } from '../entities/Message';

export interface IMessageRepository {
  save(message: Message): Promise<void>;
  findById(id: string): Promise<Message | null>;
  findByConversationId(conversationId: string, limit?: number, offset?: number): Promise<Message[]>;
  findUnreadByUserId(userId: string): Promise<Message[]>;
  markAsRead(messageId: string): Promise<void>;
  markConversationAsRead(conversationId: string, userId: string): Promise<void>;
  delete(id: string): Promise<void>;
  countUnreadByConversation(conversationId: string, userId: string): Promise<number>;
}