import { injectable, inject } from 'tsyringe';
import { IOrderRepository } from '@meu-app/domain';
import { DomainError } from '@meu-app/domain';
import { OrderDTO } from '../../dtos/OrderDTO';

interface GetOrderDetailsInput {
  orderId: string;
  requestedBy: string;
}

@injectable()
export class GetOrderDetailsUseCase {
  constructor(
    @inject('IOrderRepository')
    private orderRepository: IOrderRepository
  ) {}

  async execute(input: GetOrderDetailsInput): Promise<OrderDTO> {
    const order = await this.orderRepository.findById(input.orderId);
    
    if (!order) {
      throw new DomainError('Pedido não encontrado');
    }

    // Verificar permissão: apenas o dono do pedido ou admin pode ver detalhes
    const isOwner = order.userId === input.requestedBy;
    
    if (!isOwner) {
      // Verificar se é admin (isso deveria vir do User, mas simplificando aqui)
      // Em produção, buscar o user e verificar role
      throw new DomainError('Sem permissão para ver detalhes deste pedido');
    }

    return {
      id: order.id,
      userId: order.userId,
      totalAmount: order.totalAmount,
      totalFormatted: order.totalFormatted,
      status: order.status,
      statusDisplay: order.statusDisplay,
      statusColor: order.statusColor,
      deliveryAddress: order.deliveryAddress,
      itemCount: order.items.length, // ✅ ADICIONADO
      deliveryNotes: order.deliveryNotes || null, // ✅ ADICIONADO
      estimatedDeliveryTime: order.estimatedDeliveryTime,
      deliveredAt: order.deliveredAt,
      createdAt: order.createdAt, // ✅ ADICIONADO
      updatedAt: order.updatedAt, // ✅ ADICIONADO
    };
  }
}