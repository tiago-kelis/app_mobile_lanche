import { v4 as uuid } from 'uuid';
import { OrderItem } from './OrderItem';
import { OrderStatus, OrderStatusType } from '../value-objects/OrderStatus';
import { Money } from '../value-objects/Money';
import { DomainError } from '../errors/DomainError';

export class Order {
  private constructor(
    private readonly _id: string,
    private readonly _userId: string,
    private readonly _items: OrderItem[],
    private _status: OrderStatus,
    private _deliveryAddress: string,
    private _deliveryNotes: string | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _estimatedDeliveryTime: Date | null,
    private _deliveredAt: Date | null
  ) {}

  static create(
    userId: string,
    items: OrderItem[],
    deliveryAddress: string,
    deliveryNotes?: string
  ): Order {
    if (items.length === 0) {
      throw new DomainError('Pedido deve ter pelo menos um item');
    }

    if (deliveryAddress.length < 10) {
      throw new DomainError('Endereço de entrega inválido');
    }

    return new Order(
      uuid(),
      userId,
      items,
      OrderStatus.createPending(),
      deliveryAddress,
      deliveryNotes || null,
      new Date(),
      new Date(),
      null,
      null
    );
  }

  static reconstitute(
    id: string,
    userId: string,
    items: OrderItem[],
    status: string,
    deliveryAddress: string,
    deliveryNotes: string | null,
    createdAt: Date,
    updatedAt: Date,
    estimatedDeliveryTime: Date | null,
    deliveredAt: Date | null
  ): Order {
    return new Order(
      id,
      userId,
      items,
      OrderStatus.create(status),
      deliveryAddress,
      deliveryNotes,
      createdAt,
      updatedAt,
      estimatedDeliveryTime,
      deliveredAt
    );
  }

  get id(): string { return this._id; }
  get userId(): string { return this._userId; }
  get items(): OrderItem[] { return [...this._items]; }
  get status(): OrderStatusType { return this._status.value; }
  get statusDisplay(): string { return this._status.getDisplayName(); }
  get statusColor(): string { return this._status.getColor(); }
  get deliveryAddress(): string { return this._deliveryAddress; }
  get deliveryNotes(): string | null { return this._deliveryNotes; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }
  get estimatedDeliveryTime(): Date | null { return this._estimatedDeliveryTime; }
  get deliveredAt(): Date | null { return this._deliveredAt; }

  get total(): Money {
    return this._items.reduce(
      (acc, item) => acc.add(item.subtotal),
      Money.create(0)
    );
  }

  get totalAmount(): number {
    return this.total.amount;
  }

  get totalFormatted(): string {
    return this.total.format();
  }

  get itemCount(): number {
    return this._items.reduce((acc, item) => acc + item.quantity, 0);
  }

  startPreparing(): void {
    const newStatus = OrderStatus.create(OrderStatusType.PREPARING);
    this._status.validateTransition(newStatus);
    this._status = newStatus;
    this._updatedAt = new Date();
    
    const totalPrepTime = this._items.reduce((max, _item) => Math.max(max, 30), 0);
    this._estimatedDeliveryTime = new Date(Date.now() + (totalPrepTime + 30) * 60 * 1000);
  }

  markAsReady(): void {
    const newStatus = OrderStatus.create(OrderStatusType.READY);
    this._status.validateTransition(newStatus);
    this._status = newStatus;
    this._updatedAt = new Date();
  }

  sendForDelivery(): void {
    const newStatus = OrderStatus.create(OrderStatusType.OUT_FOR_DELIVERY);
    this._status.validateTransition(newStatus);
    this._status = newStatus;
    this._updatedAt = new Date();
  }

  markAsDelivered(): void {
    const newStatus = OrderStatus.create(OrderStatusType.DELIVERED);
    this._status.validateTransition(newStatus);
    this._status = newStatus;
    this._deliveredAt = new Date();
    this._updatedAt = new Date();
  }

  cancel(): void {
    if (this.isDelivered()) {
      throw new DomainError('Não é possível cancelar pedido já entregue');
    }
    this._status = OrderStatus.create(OrderStatusType.CANCELLED);
    this._updatedAt = new Date();
  }

  belongsTo(userId: string): boolean {
    return this._userId === userId;
  }

  isPending(): boolean { return this._status.isPending(); }
  isPreparing(): boolean { return this._status.isPreparing(); }
  isReady(): boolean { return this._status.isReady(); }
  isOutForDelivery(): boolean { return this._status.isOutForDelivery(); }
  isDelivered(): boolean { return this._status.isDelivered(); }
  isCancelled(): boolean { return this._status.isCancelled(); }
}