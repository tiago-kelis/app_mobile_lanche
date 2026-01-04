import { injectable, inject } from 'tsyringe';
import { IOrderRepository, IUserRepository, OrderStatus } from '@meu-app/domain';
import { DomainError } from '@meu-app/domain';
import { OrderStatusChangedEvent } from '@meu-app/domain';

interface UpdateOrderStatusInput {
  orderId: string;
  newStatus: string;
  updatedBy: string;
}

interface UpdateOrderStatusOutput {
  orderId: string;
  previousStatus: string;
  newStatus: string;
  updatedAt: Date;
}

@injectable()
export class UpdateOrderStatusUseCase {
  constructor(
    @inject('IOrderRepository')
    private orderRepository: IOrderRepository,
    @inject('IUserRepository') // ✅ ADICIONADO
    private userRepository: IUserRepository,
    @inject('OrderStatusChangedHandler')
    private orderStatusChangedHandler: any
  ) {}

  async execute(input: UpdateOrderStatusInput): Promise<UpdateOrderStatusOutput> {
    const order = await this.orderRepository.findById(input.orderId);
    
    if (!order) {
      throw new DomainError('Pedido não encontrado');
    }

    // ✅ ADICIONADO: Buscar informações dos usuários
    const orderOwner = await this.userRepository.findById(order.userId);
    if (!orderOwner) {
      throw new DomainError('Dono do pedido não encontrado');
    }

    const updatingUser = await this.userRepository.findById(input.updatedBy);
    if (!updatingUser) {
      throw new DomainError('Usuário que atualiza não encontrado');
    }

    const previousStatus = order.status;

    // Aplicar transição baseada no status
    switch (input.newStatus) {
      case 'PREPARING':
        order.startPreparing();
        break;
      case 'READY':
        order.markAsReady();
        break;
      case 'OUT_FOR_DELIVERY':
        order.sendForDelivery();
        break;
      case 'DELIVERED':
        order.markAsDelivered();
        break;
      case 'CANCELLED':
        order.cancel();
        break;
      default:
        throw new DomainError(`Status inválido: ${input.newStatus}`);
    }

    await this.orderRepository.save(order);

    // ✅ CORRIGIDO: Dispatch event com todos os 10 parâmetros
    const event = new OrderStatusChangedEvent(
      order.id,
      order.userId,
      orderOwner.name, // userName
      previousStatus,
      order.status,
      order.statusDisplay, // newStatusDisplay
      input.updatedBy,
      updatingUser.name, // changedByName
      order.totalAmount, // orderTotal
      order.items.map(item => ({ // orderItems
        foodName: item.foodName,
        quantity: item.quantity,
      }))
    );

    await this.orderStatusChangedHandler.handle(event);

    return {
      orderId: order.id,
      previousStatus,
      newStatus: order.status,
      updatedAt: new Date(),
    };
  }
}