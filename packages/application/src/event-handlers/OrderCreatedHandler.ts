import { injectable, inject } from 'tsyringe';
import { OrderCreatedEvent } from '@meu-app/domain';
import { INotificationService } from '../ports/output/INotificationService';

@injectable()
export class OrderCreatedHandler {
  constructor(
    @inject('INotificationService')
    private notificationService: INotificationService
  ) {}

  async handle(event: OrderCreatedEvent): Promise<void> {
    try {
      console.log('📦 Novo pedido criado:', event.orderId);

      // 1. Notificar admins sobre novo pedido
      await this.notificationService.sendToAdmins({
        title: event.getNotificationTitle(),
        message: event.getNotificationMessage(),
        type: 'new_order',
        priority: 'high',
        data: {
          orderId: event.orderId,
          userId: event.userId,
          totalAmount: event.totalAmount,
        },
      });

      // 2. Notificar cliente sobre confirmação do pedido
      await this.notificationService.sendToUser(event.userId, {
        title: 'Pedido Confirmado! ✅',
        message: event.getNotificationMessage(),
        type: 'order_status',
        priority: 'normal',
        data: {
          orderId: event.orderId,
        },
      });

      console.log(`✅ Notificações enviadas para pedido ${event.orderId}`);
    } catch (error) {
      console.error('Erro ao processar OrderCreatedEvent:', error);
      // Não propagar erro para não afetar a criação do pedido
    }
  }
}