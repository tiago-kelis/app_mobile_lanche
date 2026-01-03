import { ValidationError } from '../errors/ValidationError';

export enum UserRoleType {
  CEO = 'CEO',
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export class UserRole {
  private readonly _role: UserRoleType;

  private constructor(role: UserRoleType) {
    this._role = role;
  }

  static create(role: string): UserRole {
    const upperRole = role.toUpperCase();
    if (!Object.values(UserRoleType).includes(upperRole as UserRoleType)) {
      throw new ValidationError('Role inválida');
    }
    return new UserRole(upperRole as UserRoleType);
  }

  get value(): UserRoleType { return this._role; }
  isCEO(): boolean { return this._role === UserRoleType.CEO; }
  isAdmin(): boolean { return this._role === UserRoleType.ADMIN; }
  isUser(): boolean { return this._role === UserRoleType.USER; }
  canManageOrders(): boolean { return this.isCEO() || this.isAdmin(); }
  canUpdateToDelivered(): boolean { return this.isUser(); }
  equals(other: UserRole): boolean { return this._role === other._role; }
  toString(): string { return this._role; }
}