import { injectable, inject } from 'tsyringe';
import { IOrderRepository, IUserRepository } from '@meu-app/domain';
import { DomainError } from '@meu-app/domain';
import { OrderDeliveredEvent } from '@meu-app/domain';

interface MarkOrderAsDeliveredInput {
  orderId: string;
  deliveredBy: string; // userId que confirmou
}

interface MarkOrderAsDeliveredOutput {
  orderId: string;
  deliveredAt: Date;
  deliveryTime: number; // em minutos
}

@injectable()
export class MarkOrderAsDeliveredUseCase {
  constructor(
    @inject('IOrderRepository')
    private orderRepository: IOrderRepository,
    @inject('IUserRepository')
    private userRepository: IUserRepository,
    @inject('OrderDeliveredHandler')
    private orderDeliveredHandler: any
  ) {}

  async execute(input: MarkOrderAsDeliveredInput): Promise<MarkOrderAsDeliveredOutput> {
    const order = await this.orderRepository.findById(input.orderId);
    
    if (!order) {
      throw new DomainError('Pedido não encontrado');
    }

    const user = await this.userRepository.findById(order.userId);
    if (!user) {
      throw new DomainError('Usuário não encontrado');
    }

    // Verificar se quem está confirmando é o próprio cliente ou um admin
    const deliveredByUser = await this.userRepository.findById(input.deliveredBy);
    if (!deliveredByUser) {
      throw new DomainError('Usuário que confirma entrega não encontrado');
    }

    const isCustomer = input.deliveredBy === order.userId;
    const isAdmin = deliveredByUser.canManageOrders();

    if (!isCustomer && !isAdmin) {
      throw new DomainError('Sem permissão para confirmar entrega');
    }

    order.markAsDelivered();
    await this.orderRepository.save(order);

    // Calcular tempo de entrega
    const deliveryTime = Math.floor(
      (order.deliveredAt!.getTime() - order.createdAt.getTime()) / 60000
    );

    // Dispatch event
    const event = new OrderDeliveredEvent(
      order.id,
      order.userId,
      user.name,
      order.totalAmount,
      order.totalFormatted,
      input.deliveredBy,
      order.deliveryAddress,
      order.createdAt,
      order.deliveredAt!
    );

    await this.orderDeliveredHandler.handle(event);

    return {
      orderId: order.id,
      deliveredAt: order.deliveredAt!,
      deliveryTime,
    };
  }
}