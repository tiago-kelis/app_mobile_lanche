import { ValidationError } from '../errors/ValidationError';

export class CPF {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  static create(cpf: string): CPF {
    const cleanCPF = cpf.replace(/\D/g, '');

    if (!this.isValid(cleanCPF)) {
      throw new ValidationError('CPF inválido');
    }

    return new CPF(cleanCPF);
  }

  private static isValid(cpf: string): boolean {
    // Verificar se tem 11 dígitos
    if (cpf.length !== 11) {
      return false;
    }

    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) {
      return false;
    }

    // Validar primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = 11 - (sum % 11);
    const digit1 = remainder >= 10 ? 0 : remainder;

    if (digit1 !== parseInt(cpf.charAt(9))) {
      return false;
    }

    // Validar segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = 11 - (sum % 11);
    const digit2 = remainder >= 10 ? 0 : remainder;

    if (digit2 !== parseInt(cpf.charAt(10))) {
      return false;
    }

    return true;
  }

  get value(): string {
    return this._value;
  }

  format(): string {
    return this._value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  equals(other: CPF): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this.format();
  }
}