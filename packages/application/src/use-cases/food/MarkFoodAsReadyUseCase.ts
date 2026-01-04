import { injectable, inject } from 'tsyringe';
import { Food, FoodReadyEvent } from '@meu-app/domain';
import { IFoodRepository, IUserRepository } from '@meu-app/domain';
import { DomainError } from '@meu-app/domain';
import { FoodReadyHandler } from '../../event-handlers/FoodReadyHandler';

interface MarkFoodAsReadyInput {
  foodId: string;
  markedBy: string;
}

interface MarkFoodAsReadyOutput {
  foodId: string;
  foodName: string;
  lastReadyAt: Date;
}

@injectable()
export class MarkFoodAsReadyUseCase {
  constructor(
    @inject('IFoodRepository')
    private foodRepository: IFoodRepository,
    @inject('IUserRepository')
    private userRepository: IUserRepository,
    @inject('FoodReadyHandler')
    private foodReadyHandler: FoodReadyHandler
  ) {}

  async execute(input: MarkFoodAsReadyInput): Promise<MarkFoodAsReadyOutput> {
    const user = await this.userRepository.findById(input.markedBy);
    if (!user) {
      throw new DomainError('Usuário não encontrado');
    }

    if (!user.canManageOrders()) {
      throw new DomainError('Apenas CEO e Admin podem marcar alimentos como prontos');
    }

    const food = await this.foodRepository.findById(input.foodId);
    if (!food) {
      throw new DomainError('Alimento não encontrado');
    }

    food.markAsFreshlyReady();

    await this.foodRepository.save(food);

    const event = new FoodReadyEvent(
      food.id,
      food.name,
      food.description,
      food.price,
      food.priceFormatted,
      food.imageUrl,
      food.preparationType,
      user.id,
      user.name,
      new Date()
    );

    this.foodReadyHandler.handle(event).catch(err => {
      console.error('Erro ao processar evento de alimento fresco:', err);
    });

    return {
      foodId: food.id,
      foodName: food.name,
      lastReadyAt: food.lastReadyAt!,
    };
  }
}