import { v4 as uuid } from 'uuid';
import { DomainError } from '../errors/DomainError';

export enum MessageStatus {
  SENDING = 'SENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED',
}

export class Message {
  private constructor(
    private readonly _id: string,
    private readonly _conversationId: string,
    private readonly _senderId: string,
    private _content: string,
    private _status: MessageStatus,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _readAt: Date | null
  ) {}

  static create(
    conversationId: string,
    senderId: string,
    content: string
  ): Message {
    if (!content || content.trim().length === 0) {
      throw new DomainError('Conteúdo da mensagem não pode estar vazio');
    }

    if (content.length > 5000) {
      throw new DomainError('Mensagem muito longa (máximo 5000 caracteres)');
    }

    return new Message(
      uuid(),
      conversationId,
      senderId,
      content.trim(),
      MessageStatus.SENDING,
      new Date(),
      new Date(),
      null
    );
  }

  static reconstitute(
    id: string,
    conversationId: string,
    senderId: string,
    content: string,
    status: string,
    createdAt: Date,
    updatedAt: Date,
    readAt: Date | null
  ): Message {
    const messageStatus = MessageStatus[status as keyof typeof MessageStatus] || MessageStatus.SENT;
    
    return new Message(
      id,
      conversationId,
      senderId,
      content,
      messageStatus,
      createdAt,
      updatedAt,
      readAt
    );
  }

  get id(): string {
    return this._id;
  }

  get conversationId(): string {
    return this._conversationId;
  }

  get senderId(): string {
    return this._senderId;
  }

  get content(): string {
    return this._content;
  }

  get status(): MessageStatus {
    return this._status;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get readAt(): Date | null {
    return this._readAt;
  }

  markAsSent(): void {
    if (this._status !== MessageStatus.SENDING) {
      throw new DomainError('Apenas mensagens em envio podem ser marcadas como enviadas');
    }
    this._status = MessageStatus.SENT;
    this._updatedAt = new Date();
  }

  markAsDelivered(): void {
    if (this._status !== MessageStatus.SENT) {
      throw new DomainError('Apenas mensagens enviadas podem ser marcadas como entregues');
    }
    this._status = MessageStatus.DELIVERED;
    this._updatedAt = new Date();
  }

  markAsRead(): void {
    if (this._status === MessageStatus.READ) {
      return; // Já foi lida
    }

    if (this._status === MessageStatus.SENDING || this._status === MessageStatus.FAILED) {
      throw new DomainError('Mensagem não pode ser marcada como lida neste estado');
    }

    this._status = MessageStatus.READ;
    this._readAt = new Date();
    this._updatedAt = new Date();
  }

  markAsFailed(): void {
    this._status = MessageStatus.FAILED;
    this._updatedAt = new Date();
  }

  isSentBy(userId: string): boolean {
    return this._senderId === userId;
  }

  isRead(): boolean {
    return this._status === MessageStatus.READ;
  }

  isDelivered(): boolean {
    return this._status === MessageStatus.DELIVERED || this._status === MessageStatus.READ;
  }

  isFailed(): boolean {
    return this._status === MessageStatus.FAILED;
  }
}