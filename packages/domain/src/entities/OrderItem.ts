import { v4 as uuid } from 'uuid';
import { Money } from '../value-objects/Money';
import { DomainError } from '../errors/DomainError';

export class OrderItem {
  private constructor(
    private readonly _id: string,
    private readonly _foodId: string,
    private readonly _foodName: string,
    private readonly _quantity: number,
    private readonly _unitPrice: Money,
    private readonly _notes: string | null
  ) {}

  static create(
    foodId: string,
    foodName: string,
    quantity: number,
    unitPrice: number,
    notes?: string
  ): OrderItem {
    if (quantity <= 0) {
      throw new DomainError('Quantidade deve ser maior que zero');
    }
    if (foodName.length === 0) {
      throw new DomainError('Nome do alimento é obrigatório');
    }
    return new OrderItem(
      uuid(),
      foodId,
      foodName,
      quantity,
      Money.create(unitPrice),
      notes || null
    );
  }

  static reconstitute(
    id: string,
    foodId: string,
    foodName: string,
    quantity: number,
    unitPrice: number,
    notes: string | null
  ): OrderItem {
    return new OrderItem(
      id,
      foodId,
      foodName,
      quantity,
      Money.create(unitPrice),
      notes
    );
  }

  get id(): string { return this._id; }
  get foodId(): string { return this._foodId; }
  get foodName(): string { return this._foodName; }
  get quantity(): number { return this._quantity; }
  get unitPrice(): number { return this._unitPrice.amount; }
  get notes(): string | null { return this._notes; }

  get subtotal(): Money {
    return this._unitPrice.multiply(this._quantity);
  }

  get subtotalAmount(): number {
    return this.subtotal.amount;
  }

  get subtotalFormatted(): string {
    return this.subtotal.format();
  }
}