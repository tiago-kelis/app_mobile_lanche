import { injectable, inject } from 'tsyringe';
import { OrderStatusChangedEvent } from '@meu-app/domain';
import { INotificationService } from '../ports/output/INotificationService';

@injectable()
export class OrderStatusChangedHandler {
  constructor(
    @inject('INotificationService')
    private notificationService: INotificationService
  ) {}

  async handle(event: OrderStatusChangedEvent): Promise<void> {
    try {
      if (event.shouldNotifyUser()) {
        await this.notificationService.sendToUser(event.userId, {
          title: event.getNotificationTitle(),
          message: event.getNotificationMessage(),
          type: 'order_status',
          priority: 'high',
          data: {
            orderId: event.orderId,
            status: event.newStatus,
            statusDisplay: event.newStatusDisplay,
          },
        });

        console.log(`📬 Notificação enviada para usuário ${event.userId}`);
      }

      if (event.shouldNotifyAdmins()) {
        await this.notificationService.sendToAdmins({
          title: event.getNotificationTitle(),
          message: `${event.userName} ${
            event.newStatus === 'DELIVERED'
              ? 'confirmou o recebimento'
              : 'cancelou o pedido'
          } #${event.orderId.substring(0, 8)}`,
          type: 'order_status',
          priority: 'normal',
          data: {
            orderId: event.orderId,
            userId: event.userId,
            status: event.newStatus,
          },
        });

        console.log('📬 Notificação enviada para admins');
      }
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
    }
  }
}