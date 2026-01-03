import { v4 as uuid } from 'uuid';
import { DomainError } from '../errors/DomainError';

export enum ConversationType {
  PRIVATE = 'PRIVATE',
  GROUP = 'GROUP',
}

export class Conversation {
  private constructor(
    private readonly _id: string,
    private _name: string | null,
    private readonly _type: ConversationType,
    private _participantIds: string[],
    private _lastMessageAt: Date,
    private readonly _createdAt: Date,
    private _updatedAt: Date
  ) {}

  static createPrivate(participant1Id: string, participant2Id: string): Conversation {
    if (participant1Id === participant2Id) {
      throw new DomainError('Não é possível criar conversa privada com você mesmo');
    }

    return new Conversation(
      uuid(),
      null,
      ConversationType.PRIVATE,
      [participant1Id, participant2Id],
      new Date(),
      new Date(),
      new Date()
    );
  }

  static createGroup(name: string, participantIds: string[]): Conversation {
    if (!name || name.trim().length === 0) {
      throw new DomainError('Nome do grupo é obrigatório');
    }

    if (participantIds.length < 2) {
      throw new DomainError('Grupo deve ter pelo menos 2 participantes');
    }

    if (participantIds.length > 100) {
      throw new DomainError('Grupo não pode ter mais de 100 participantes');
    }

    // Remover duplicatas
    const uniqueParticipants = Array.from(new Set(participantIds));

    return new Conversation(
      uuid(),
      name.trim(),
      ConversationType.GROUP,
      uniqueParticipants,
      new Date(),
      new Date(),
      new Date()
    );
  }

  static reconstitute(
    id: string,
    name: string | null,
    type: string,
    participantIds: string[],
    lastMessageAt: Date,
    createdAt: Date,
    updatedAt: Date
  ): Conversation {
    const conversationType = 
      type === 'GROUP' ? ConversationType.GROUP : ConversationType.PRIVATE;

    return new Conversation(
      id,
      name,
      conversationType,
      participantIds,
      lastMessageAt,
      createdAt,
      updatedAt
    );
  }

  get id(): string {
    return this._id;
  }

  get name(): string | null {
    return this._name;
  }

  get type(): ConversationType {
    return this._type;
  }

  get participantIds(): string[] {
    return [...this._participantIds];
  }

  get lastMessageAt(): Date {
    return this._lastMessageAt;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  isPrivate(): boolean {
    return this._type === ConversationType.PRIVATE;
  }

  isGroup(): boolean {
    return this._type === ConversationType.GROUP;
  }

  hasParticipant(userId: string): boolean {
    return this._participantIds.includes(userId);
  }

  addParticipant(userId: string): void {
    if (!this.isGroup()) {
      throw new DomainError('Apenas grupos podem adicionar participantes');
    }

    if (this.hasParticipant(userId)) {
      throw new DomainError('Participante já está no grupo');
    }

    if (this._participantIds.length >= 100) {
      throw new DomainError('Grupo está cheio (máximo 100 participantes)');
    }

    this._participantIds.push(userId);
    this._updatedAt = new Date();
  }

  removeParticipant(userId: string): void {
    if (!this.isGroup()) {
      throw new DomainError('Apenas grupos podem remover participantes');
    }

    if (!this.hasParticipant(userId)) {
      throw new DomainError('Participante não está no grupo');
    }

    if (this._participantIds.length <= 2) {
      throw new DomainError('Grupo deve ter pelo menos 2 participantes');
    }

    this._participantIds = this._participantIds.filter(id => id !== userId);
    this._updatedAt = new Date();
  }

  updateGroupName(newName: string): void {
    if (!this.isGroup()) {
      throw new DomainError('Apenas grupos podem ter nome alterado');
    }

    if (!newName || newName.trim().length === 0) {
      throw new DomainError('Nome do grupo não pode estar vazio');
    }

    this._name = newName.trim();
    this._updatedAt = new Date();
  }

  updateLastMessage(): void {
    this._lastMessageAt = new Date();
    this._updatedAt = new Date();
  }

  getDisplayName(currentUserId: string): string {
    if (this.isGroup()) {
      return this._name || 'Grupo sem nome';
    }

    // Conversa privada: retornar o ID do outro participante
    const otherParticipantId = this._participantIds.find(id => id !== currentUserId);
    return otherParticipantId || 'Conversa privada';
  }

  getParticipantCount(): number {
    return this._participantIds.length;
  }
}