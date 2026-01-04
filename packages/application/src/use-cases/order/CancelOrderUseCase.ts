import { injectable, inject } from 'tsyringe';
import { IOrderRepository, IUserRepository } from '@meu-app/domain';
import { DomainError } from '@meu-app/domain';
import { OrderStatusChangedEvent } from '@meu-app/domain';

interface CancelOrderInput {
  orderId: string;
  cancelledBy: string;
  reason?: string;
}

interface CancelOrderOutput {
  orderId: string;
  previousStatus: string;
  cancelledAt: Date;
}

@injectable()
export class CancelOrderUseCase {
  constructor(
    @inject('IOrderRepository')
    private orderRepository: IOrderRepository,
    @inject('IUserRepository')
    private userRepository: IUserRepository,
    @inject('OrderStatusChangedHandler')
    private orderStatusChangedHandler: any
  ) {}

  async execute(input: CancelOrderInput): Promise<CancelOrderOutput> {
    const order = await this.orderRepository.findById(input.orderId);
    
    if (!order) {
      throw new DomainError('Pedido não encontrado');
    }

    const cancellingUser = await this.userRepository.findById(input.cancelledBy);
    if (!cancellingUser) {
      throw new DomainError('Usuário não encontrado');
    }

    // Buscar informações do dono do pedido
    const orderOwner = await this.userRepository.findById(order.userId);
    if (!orderOwner) {
      throw new DomainError('Dono do pedido não encontrado');
    }

    // Verificar permissão
    const isOwner = order.userId === input.cancelledBy;
    const isAdmin = cancellingUser.canManageOrders();

    if (!isOwner && !isAdmin) {
      throw new DomainError('Sem permissão para cancelar este pedido');
    }

    // Cliente só pode cancelar pedidos que ainda não estão em entrega
    if (isOwner && !isAdmin) {
      if (order.status === 'OUT_FOR_DELIVERY' || order.status === 'DELIVERED') {
        throw new DomainError('Não é possível cancelar pedido que já saiu para entrega');
      }
    }

    const previousStatus = order.status;

    // Cancelar pedido (sem parâmetros)
    order.cancel();
    await this.orderRepository.save(order);

    // Dispatch event com todos os parâmetros corretos
    const event = new OrderStatusChangedEvent(
      order.id,
      order.userId,
      orderOwner.name,
      previousStatus,
      'CANCELLED',
      'Cancelado',
      input.cancelledBy,
      cancellingUser.name,
      order.totalAmount,
      order.items.map(item => ({
        foodName: item.foodName,
        quantity: item.quantity,
      }))
    );

    await this.orderStatusChangedHandler.handle(event);

    return {
      orderId: order.id,
      previousStatus,
      cancelledAt: new Date(),
    };
  }
}