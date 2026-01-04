import { injectable, inject } from 'tsyringe';
import { IFoodRepository } from '@meu-app/domain';
import { FoodDTO } from '../../dtos/FoodDTO';

interface ListFreshFoodsOutput {
  freshFoods: FoodDTO[];
  total: number;
}

@injectable()
export class ListFreshFoodsUseCase {
  constructor(
    @inject('IFoodRepository')
    private foodRepository: IFoodRepository
  ) {}

  async execute(): Promise<ListFreshFoodsOutput> {
    const allFoods = await this.foodRepository.findAvailable();

    // Filtrar apenas os frescos (últimas 2 horas)
    const freshFoods = allFoods.filter(food => food.isFresh());

    // Ordenar por mais recente primeiro
    freshFoods.sort((a, b) => {
      if (!a.lastReadyAt || !b.lastReadyAt) return 0;
      return b.lastReadyAt.getTime() - a.lastReadyAt.getTime();
    });

    const foodDTOs: FoodDTO[] = freshFoods.map(food => ({
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
      freshFoods: foodDTOs,
      total: foodDTOs.length,
    };
  }
}