import { ValidationError } from '../errors/ValidationError';
import { DomainError } from '../errors/DomainError';

export enum OrderStatusType {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  READY = 'READY',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export class OrderStatus {
  private readonly _status: OrderStatusType;

  private constructor(status: OrderStatusType) {
    this._status = status;
  }

  static create(status: string): OrderStatus {
    const upperStatus = status.toUpperCase();
    if (!Object.values(OrderStatusType).includes(upperStatus as OrderStatusType)) {
      throw new ValidationError('Status inválido');
    }
    return new OrderStatus(upperStatus as OrderStatusType);
  }

  static createPending(): OrderStatus {
    return new OrderStatus(OrderStatusType.PENDING);
  }

  get value(): OrderStatusType { return this._status; }

  canTransitionTo(newStatus: OrderStatus): boolean {
    const transitions: Record<OrderStatusType, OrderStatusType[]> = {
      [OrderStatusType.PENDING]: [OrderStatusType.PREPARING, OrderStatusType.CANCELLED],
      [OrderStatusType.PREPARING]: [OrderStatusType.READY, OrderStatusType.CANCELLED],
      [OrderStatusType.READY]: [OrderStatusType.OUT_FOR_DELIVERY, OrderStatusType.CANCELLED],
      [OrderStatusType.OUT_FOR_DELIVERY]: [OrderStatusType.DELIVERED, OrderStatusType.CANCELLED],
      [OrderStatusType.DELIVERED]: [],
      [OrderStatusType.CANCELLED]: [],
    };
    return transitions[this._status].includes(newStatus.value);
  }

  validateTransition(newStatus: OrderStatus): void {
    if (!this.canTransitionTo(newStatus)) {
      throw new DomainError(`Transição inválida de ${this._status} para ${newStatus.value}`);
    }
  }

  getDisplayName(): string {
    const names: Record<OrderStatusType, string> = {
      [OrderStatusType.PENDING]: 'Aguardando',
      [OrderStatusType.PREPARING]: 'Preparando',
      [OrderStatusType.READY]: 'Pronto',
      [OrderStatusType.OUT_FOR_DELIVERY]: 'Saiu para Entrega',
      [OrderStatusType.DELIVERED]: 'Entregue',
      [OrderStatusType.CANCELLED]: 'Cancelado',
    };
    return names[this._status];
  }

  getColor(): string {
    const colors: Record<OrderStatusType, string> = {
      [OrderStatusType.PENDING]: '#FFA500',
      [OrderStatusType.PREPARING]: '#2196F3',
      [OrderStatusType.READY]: '#9C27B0',
      [OrderStatusType.OUT_FOR_DELIVERY]: '#FF9800',
      [OrderStatusType.DELIVERED]: '#4CAF50',
      [OrderStatusType.CANCELLED]: '#F44336',
    };
    return colors[this._status];
  }

  isPending(): boolean { return this._status === OrderStatusType.PENDING; }
  isPreparing(): boolean { return this._status === OrderStatusType.PREPARING; }
  isReady(): boolean { return this._status === OrderStatusType.READY; }
  isOutForDelivery(): boolean { return this._status === OrderStatusType.OUT_FOR_DELIVERY; }
  isDelivered(): boolean { return this._status === OrderStatusType.DELIVERED; }
  isCancelled(): boolean { return this._status === OrderStatusType.CANCELLED; }
}