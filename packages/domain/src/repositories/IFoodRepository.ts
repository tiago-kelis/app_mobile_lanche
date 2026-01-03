import { Food } from '../entities/Food';

export interface IFoodRepository {
  save(food: Food): Promise<void>;
  findById(id: string): Promise<Food | null>;
  findAvailable(): Promise<Food[]>;
  findAll(): Promise<Food[]>;
  delete(id: string): Promise<void>;
}