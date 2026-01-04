import { injectable, inject } from 'tsyringe';
import { IOrderRepository, IUserRepository, OrderStatus } from '@meu-app/domain';
import { DomainError } from '@meu-app/domain';
import { OrderDTO } from '../../dtos/OrderDTO';

interface ListOrdersInput {
  userId?: string;
  status?: string;
  requestedBy: string;
  limit?: number;
  offset?: number;
}

interface ListOrdersOutput {
  orders: OrderDTO[];
  total: number;
  hasMore: boolean;
}

@injectable()
export class ListOrdersUseCase {
  constructor(
    @inject('IOrderRepository')
    private orderRepository: IOrderRepository,
    @inject('IUserRepository')
    private userRepository: IUserRepository
  ) {}

  async execute(input: ListOrdersInput): Promise<ListOrdersOutput> {
    const requestingUser = await this.userRepository.findById(input.requestedBy);
    
    if (!requestingUser) {
      throw new DomainError('Usuário não encontrado');
    }

    const isAdmin = requestingUser.canManageOrders();
    const limit = input.limit || 20;
    const offset = input.offset || 0;

    let orders;

    if (input.userId) {
      // Buscar pedidos de um usuário específico
      if (!isAdmin && input.userId !== input.requestedBy) {
        throw new DomainError('Sem permissão para ver pedidos de outro usuário');
      }
      orders = await this.orderRepository.findByUserId(input.userId);
    } else if (input.status) {
      // Buscar por status (apenas admins)
      if (!isAdmin) {
        throw new DomainError('Apenas administradores podem filtrar por status');
      }
      // ✅ CORRIGIDO: Converter string para OrderStatus
      const orderStatus = OrderStatus.create(input.status);
      orders = await this.orderRepository.findByStatus(orderStatus.value);
    } else if (isAdmin) {
      // Admin pode ver todos
      orders = await this.orderRepository.findAll();
    } else {
      // Usuário comum só vê seus próprios pedidos
      orders = await this.orderRepository.findByUserId(input.requestedBy);
    }

    // Ordenar por data (mais recentes primeiro)
    orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = orders.length;
    const paginatedOrders = orders.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    const orderDTOs: OrderDTO[] = paginatedOrders.map(order => ({
      id: order.id,
      userId: order.userId,
      totalAmount: order.totalAmount,
      totalFormatted: order.totalFormatted, // ✅ CORRIGIDO: era formattedTotal
      status: order.status,
      statusDisplay: order.statusDisplay, // ✅ ADICIONADO
      statusColor: order.statusColor, // ✅ ADICIONADO
      deliveryAddress: order.deliveryAddress,
      itemCount: order.items.length, // ✅ ADICIONADO
      deliveryNotes: order.deliveryNotes || null, // ✅ ADICIONADO
      estimatedDeliveryTime: order.estimatedDeliveryTime,
      deliveredAt: order.deliveredAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }));

    return {
      orders: orderDTOs,
      total,
      hasMore,
    };
  }
}