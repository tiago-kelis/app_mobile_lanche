import { v4 as uuid } from 'uuid';
import { Money } from '../value-objects/Money';
import { DomainError } from '../errors/DomainError';

export type PreparationType = 'oven' | 'fried' | 'grilled' | 'cooked' | 'baked';

export class Food {
  private constructor(
    private readonly _id: string,
    private _name: string,
    private _description: string,
    private _price: Money,
    private _imageUrl: string | null,
    private _available: boolean,
    private _preparationTimeMinutes: number,
    private _preparationType: PreparationType,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _lastReadyAt: Date | null
  ) {}

  static create(
    name: string,
    description: string,
    price: number,
    preparationTimeMinutes: number,
    preparationType: PreparationType,
    imageUrl?: string
  ): Food {
    if (name.length < 3) {
      throw new DomainError('Nome do alimento deve ter no mínimo 3 caracteres');
    }

    if (preparationTimeMinutes < 0) {
      throw new DomainError('Tempo de preparo não pode ser negativo');
    }

    const priceVO = Money.create(price);

    return new Food(
      uuid(),
      name,
      description,
      priceVO,
      imageUrl || null,
      true,
      preparationTimeMinutes,
      preparationType,
      new Date(),
      new Date(),
      null
    );
  }

  static reconstitute(
    id: string,
    name: string,
    description: string,
    price: number,
    imageUrl: string | null,
    available: boolean,
    preparationTimeMinutes: number,
    preparationType: PreparationType,
    createdAt: Date,
    updatedAt: Date,
    lastReadyAt: Date | null
  ): Food {
    return new Food(
      id,
      name,
      description,
      Money.create(price),
      imageUrl,
      available,
      preparationTimeMinutes,
      preparationType,
      createdAt,
      updatedAt,
      lastReadyAt
    );
  }

  get id(): string { return this._id; }
  get name(): string { return this._name; }
  get description(): string { return this._description; }
  get price(): number { return this._price.amount; }
  get priceFormatted(): string { return this._price.format(); }
  get imageUrl(): string | null { return this._imageUrl; }
  get available(): boolean { return this._available; }
  get preparationTimeMinutes(): number { return this._preparationTimeMinutes; }
  get preparationType(): PreparationType { return this._preparationType; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }
  get lastReadyAt(): Date | null { return this._lastReadyAt; }

  markAsFreshlyReady(): void {
    if (!this._available) {
      throw new DomainError('Alimento indisponível não pode ser marcado como pronto');
    }
    this._lastReadyAt = new Date();
    this._updatedAt = new Date();
  }

  makeAvailable(): void {
    if (this._available) {
      throw new DomainError('Alimento já está disponível');
    }
    this._available = true;
    this._updatedAt = new Date();
  }

  makeUnavailable(): void {
    if (!this._available) {
      throw new DomainError('Alimento já está indisponível');
    }
    this._available = false;
    this._updatedAt = new Date();
  }

  isFresh(): boolean {
    if (!this._lastReadyAt) return false;
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    return this._lastReadyAt > twoHoursAgo;
  }

  getPreparationTypeDisplay(): string {
    const displays: Record<PreparationType, string> = {
      oven: 'Assado no Forno',
      fried: 'Frito',
      grilled: 'Grelhado',
      cooked: 'Cozido',
      baked: 'Assado',
    };
    return displays[this._preparationType];
  }

  getPreparationTypeEmoji(): string {
    const emojis: Record<PreparationType, string> = {
      oven: '🔥',
      fried: '🍳',
      grilled: '🔥',
      cooked: '🍲',
      baked: '🥐',
    };
    return emojis[this._preparationType];
  }
}