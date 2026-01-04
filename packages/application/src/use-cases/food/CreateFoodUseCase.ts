import { injectable, inject } from 'tsyringe';
import { Food, IFoodRepository, IUserRepository, PreparationType } from '@meu-app/domain';
import { DomainError } from '@meu-app/domain';
import { FoodDTO, CreateFoodDTO } from '../../dtos/FoodDTO';

@injectable()
export class CreateFoodUseCase {
  constructor(
    @inject('IFoodRepository')
    private foodRepository: IFoodRepository,
    @inject('IUserRepository')
    private userRepository: IUserRepository
  ) {}

  async execute(input: CreateFoodDTO): Promise<FoodDTO> {
    // Verificar permissão
    const user = await this.userRepository.findById(input.createdBy);
    if (!user || !user.canManageOrders()) {
      throw new DomainError('Sem permissão para criar alimentos');
    }
    
    // Criar alimento
    const food = Food.create(
      input.name,
      input.description,
      input.price,
      input.preparationTimeMinutes || 30, // Valor padrão se não informado
      input.preparationType,
      input.imageUrl
    );

    await this.foodRepository.save(food);

    return {
      id: food.id,
      name: food.name,
      description: food.description,
      price: food.price,
      priceFormatted: food.priceFormatted,
      imageUrl: food.imageUrl,
      available: food.available,
      preparationTimeMinutes: food.preparationTimeMinutes,
      preparationType: food.preparationType,
       preparationTypeDisplay: food.getPreparationTypeDisplay(), // ✅ CORRIGIDO: chamar o método
      preparationTypeEmoji: food.getPreparationTypeEmoji(), // ✅ CORRIGIDO: chamar o método
      lastReadyAt: food.lastReadyAt,
      isFresh: food.isFresh(),
    };
  }
}