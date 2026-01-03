import { ValidationError } from '../errors/ValidationError';

export class Email {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  static create(email: string): Email {
    if (!this.isValid(email)) {
      throw new ValidationError('Email inválido');
    }
    return new Email(email.toLowerCase());
  }

  private static isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  get value(): string {
    return this._value;
  }

  equals(other: Email): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}