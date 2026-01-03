import { v4 as uuid } from 'uuid';
import { Email } from '../value-objects/Email';
import { UserRole, UserRoleType } from '../value-objects/UserRole';
import { DomainError } from '../errors/DomainError';

export class User {
  private constructor(
    private readonly _id: string,
    private _name: string,
    private readonly _email: Email,
    private _role: UserRole,
    private _active: boolean,
    private readonly _createdAt: Date,
    private _updatedAt: Date
  ) {}

  static create(name: string, email: string, role: string): User {
    const emailVO = Email.create(email);
    const roleVO = UserRole.create(role);
    
    if (name.length < 3) {
      throw new DomainError('Nome deve ter no mínimo 3 caracteres');
    }

    return new User(
      uuid(),
      name,
      emailVO,
      roleVO,
      true,
      new Date(),
      new Date()
    );
  }

  static reconstitute(
    id: string,
    name: string,
    email: string,
    role: string,
    active: boolean,
    createdAt: Date,
    updatedAt: Date
  ): User {
    return new User(
      id,
      name,
      Email.create(email),
      UserRole.create(role),
      active,
      createdAt,
      updatedAt
    );
  }

  get id(): string { return this._id; }
  get name(): string { return this._name; }
  get email(): string { return this._email.value; }
  get role(): UserRoleType { return this._role.value; }
  get active(): boolean { return this._active; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  changeName(newName: string): void {
    if (newName.length < 3) {
      throw new DomainError('Nome deve ter no mínimo 3 caracteres');
    }
    this._name = newName;
    this._updatedAt = new Date();
  }

  changeRole(newRole: string): void {
    this._role = UserRole.create(newRole);
    this._updatedAt = new Date();
  }

  deactivate(): void {
    if (!this._active) {
      throw new DomainError('Usuário já está inativo');
    }
    this._active = false;
    this._updatedAt = new Date();
  }

  activate(): void {
    if (this._active) {
      throw new DomainError('Usuário já está ativo');
    }
    this._active = true;
    this._updatedAt = new Date();
  }

  canManageOrders(): boolean {
    return this._role.canManageOrders();
  }

  canUpdateToDelivered(): boolean {
    return this._role.canUpdateToDelivered();
  }

  isCEO(): boolean {
    return this._role.isCEO();
  }

  isAdmin(): boolean {
    return this._role.isAdmin();
  }

  isUser(): boolean {
    return this._role.isUser();
  }
}