export interface FoodDTO {
  id: string;
  name: string;
  description: string;
  price: number;
  priceFormatted: string;
  imageUrl: string | null;
  available: boolean;
  preparationTimeMinutes: number;
  preparationType: string;
  preparationTypeDisplay: string;
  preparationTypeEmoji: string;
  lastReadyAt: Date | null;
  isFresh: boolean;
}

export interface CreateFoodDTO {
  name: string;
  description: string;
  price: number;
  preparationTimeMinutes?: number;
  preparationType: 'oven' | 'fried' | 'grilled' | 'cooked' | 'baked';
  imageUrl?: string;
  createdBy: string;
}