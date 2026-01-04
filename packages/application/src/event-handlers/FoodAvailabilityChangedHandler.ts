import { injectable, inject } from 'tsyringe';
import { FoodAvailabilityChangedEvent } from '@meu-app/domain';
import { INotificationService } from '../ports/output/INotificationService';

@injectable()
export class FoodAvailabilityChangedHandler {
  constructor(
    @inject('INotificationService')
    private notificationService: INotificationService
  ) {}

  async handle(event: FoodAvailabilityChangedEvent): Promise<void> {
    try {
      console.log(
        `🔄 Disponibilidade alterada: ${event.foodName} → ${event.available ? 'Disponível' : 'Indisponível'}`
      );

      // 1. Sempre notificar admins
      await this.notificationService.sendToAdmins({
        title: '🔄 Disponibilidade Alterada',
        message: event.getAdminNotificationMessage(),
        type: 'food_availability',
        priority: 'normal',
        data: {
          foodId: event.foodId,
          available: event.available,
        },
      });

      // 2. Se voltou disponível, broadcast para todos os clientes
      if (event.shouldBroadcastToAll()) {
        await this.notificationService.broadcast({
          title: event.getNotificationTitle(),
          message: event.getNotificationMessage(),
          type: 'food_availability',
          priority: 'high',
          data: {
            foodId: event.foodId,
            foodName: event.foodName,
            price: event.price,
          },
        });

        console.log(`📢 Broadcast enviado: ${event.foodName} disponível novamente`);
      }

      console.log(`✅ Notificações de disponibilidade enviadas para ${event.foodName}`);
    } catch (error) {
      console.error('Erro ao processar FoodAvailabilityChangedEvent:', error);
      // Não propagar erro
    }
  }
}