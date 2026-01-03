import { ValidationError } from '../errors/ValidationError';

export class Money {
  private readonly _amount: number;
  private readonly _currency: string;

  private constructor(amount: number, currency: string = 'BRL') {
    this._amount = amount;
    this._currency = currency;
  }

  static create(amount: number, currency: string = 'BRL'): Money {
    if (amount < 0) {
      throw new ValidationError('Valor não pode ser negativo');
    }
    return new Money(amount, currency);
  }

  get amount(): number {
    return this._amount;
  }

  get currency(): string {
    return this._currency;
  }

  add(other: Money): Money {
    if (this._currency !== other._currency) {
      throw new ValidationError('Moedas diferentes não podem ser somadas');
    }
    return new Money(this._amount + other._amount, this._currency);
  }

  multiply(factor: number): Money {
    return new Money(this._amount * factor, this._currency);
  }

  format(): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: this._currency,
    }).format(this._amount);
  }

  equals(other: Money): boolean {
    return this._amount === other._amount && this._currency === other._currency;
  }
}