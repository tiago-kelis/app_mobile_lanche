import { injectable, inject } from 'tsyringe';
import { IFoodRepository } from '@meu-app/domain';
import { FoodDTO } from '../../dtos/FoodDTO';

interface ListFoodsInput {
  availableOnly?: boolean;
  limit?: number;
  offset?: number;
}

interface ListFoodsOutput {
  foods: FoodDTO[];
  total: number;
  hasMore: boolean;
}

@injectable()
export class ListFoodsUseCase {
  constructor(
    @inject('IFoodRepository')
    private foodRepository: IFoodRepository
  ) {}

  async execute(input: ListFoodsInput = {}): Promise<ListFoodsOutput> {
    const limit = input.limit || 50;
    const offset = input.offset || 0;

    let foods;

    if (input.availableOnly) {
      foods = await this.foodRepository.findAvailable();
    } else {
      foods = await this.foodRepository.findAll();
    }

    // Ordenar por nome
    foods.sort((a, b) => a.name.localeCompare(b.name));

    const total = foods.length;
    const paginatedFoods = foods.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    const foodDTOs: FoodDTO[] = paginatedFoods.map(food => ({
      id: food.id,
      name: food.name,
      description: food.description,
      price: food.price,
      priceFormatted: food.priceFormatted,
      imageUrl: food.imageUrl,
      available: food.available,
      preparationTimeMinutes: food.preparationTimeMinutes, // ✅ ADICIONADO
      preparationType: food.preparationType, // ✅ Já é string no Food
      preparationTypeDisplay: food.getPreparationTypeDisplay(), // ✅ ADICIONADO
      preparationTypeEmoji: food.getPreparationTypeEmoji(), // ✅ ADICIONADO
      lastReadyAt: food.lastReadyAt,
      isFresh: food.isFresh(),
    }));

    return {
      foods: foodDTOs,
      total,
      hasMore,
    };
  }
}