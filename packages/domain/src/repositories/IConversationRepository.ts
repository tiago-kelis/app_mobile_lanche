import { Conversation } from '../entities/Conversation';

export interface IConversationRepository {
  save(conversation: Conversation): Promise<void>;
  findById(id: string): Promise<Conversation | null>;
  findByParticipant(userId: string): Promise<Conversation[]>;
  findPrivateConversation(user1Id: string, user2Id: string): Promise<Conversation | null>;
  findAll(): Promise<Conversation[]>;
  delete(id: string): Promise<void>;
}