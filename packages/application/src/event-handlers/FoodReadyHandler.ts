import { injectable, inject } from 'tsyringe';
import { FoodReadyEvent } from '@meu-app/domain';
import { INotificationService } from '../ports/output/INotificationService';

@injectable()
export class FoodReadyHandler {
  constructor(
    @inject('INotificationService')
    private notificationService: INotificationService
  ) {}

  async handle(event: FoodReadyEvent): Promise<void> {
    try {
      if (event.shouldBroadcastToAll()) {
        await this.notificationService.broadcast({
          title: event.getNotificationTitle(),
          message: event.getNotificationMessage(),
          type: 'fresh_food',
          priority: 'high',
          data: {
            foodId: event.foodId,
            foodName: event.foodName,
            price: event.price,
            priceFormatted: event.priceFormatted,
            imageUrl: event.imageUrl,
            preparationType: event.preparationType,
          },
        });

        console.log(`🍕 Notificação de alimento fresco enviada para todos: ${event.foodName}`);
      }
    } catch (error) {
      console.error('Erro ao enviar notificação de alimento fresco:', error);
    }
  }
}