import { injectable, inject } from 'tsyringe';
import { IFoodRepository, IUserRepository } from '@meu-app/domain';
import { DomainError } from '@meu-app/domain';
import { FoodAvailabilityChangedEvent } from '@meu-app/domain';

interface ToggleFoodAvailabilityInput {
  foodId: string;
  available: boolean;
  changedBy: string;
  reason?: string;
}

interface ToggleFoodAvailabilityOutput {
  foodId: string;
  available: boolean;
  updatedAt: Date;
}

@injectable()
export class ToggleFoodAvailabilityUseCase {
  constructor(
    @inject('IFoodRepository')
    private foodRepository: IFoodRepository,
    @inject('IUserRepository')
    private userRepository: IUserRepository,
    @inject('FoodAvailabilityChangedHandler')
    private foodAvailabilityChangedHandler: any
  ) {}

  async execute(input: ToggleFoodAvailabilityInput): Promise<ToggleFoodAvailabilityOutput> {
    // Verificar permissão
    const user = await this.userRepository.findById(input.changedBy);
    if (!user || !user.canManageOrders()) {
      throw new DomainError('Sem permissão para alterar disponibilidade');
    }

    const food = await this.foodRepository.findById(input.foodId);
    if (!food) {
      throw new DomainError('Alimento não encontrado');
    }

    if (input.available) {
      food.makeAvailable();
    } else {
      food.makeUnavailable();
    }

    await this.foodRepository.save(food);

    // Dispatch event
    const event = new FoodAvailabilityChangedEvent(
      food.id,
      food.name,
      food.description,
      food.price,
      food.priceFormatted,
      food.imageUrl,
      food.available,
      input.changedBy,
      user.name,
      input.reason || null
    );

    await this.foodAvailabilityChangedHandler.handle(event);

    return {
      foodId: food.id,
      available: food.available,
      updatedAt: new Date(),
    };
  }
}