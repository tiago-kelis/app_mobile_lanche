import { injectable, inject } from 'tsyringe';
import { Order, OrderItem, OrderCreatedEvent } from '@meu-app/domain';
import { IOrderRepository, IFoodRepository, IUserRepository } from '@meu-app/domain';
import { DomainError } from '@meu-app/domain';
import { OrderCreatedHandler } from '../../event-handlers/OrderCreatedHandler';

interface OrderItemInput {
  foodId: string;
  quantity: number;
  notes?: string;
}

interface CreateOrderInput {
  userId: string;
  items: OrderItemInput[];
  deliveryAddress: string;
  deliveryNotes?: string;
}

interface CreateOrderOutput {
  orderId: string;
  status: string;
  totalAmount: number;
  totalFormatted: string;
  itemCount: number;
  estimatedDeliveryTime: Date | null;
  createdAt: Date;
}

@injectable()
export class CreateOrderUseCase {
  constructor(
    @inject('IOrderRepository')
    private orderRepository: IOrderRepository,
    @inject('IFoodRepository')
    private foodRepository: IFoodRepository,
    @inject('IUserRepository')
    private userRepository: IUserRepository,
    @inject('OrderCreatedHandler')
    private orderCreatedHandler: OrderCreatedHandler
  ) {}

  async execute(input: CreateOrderInput): Promise<CreateOrderOutput> {
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new DomainError('Usuário não encontrado');
    }

    if (!user.active) {
      throw new DomainError('Usuário inativo não pode fazer pedidos');
    }

    const orderItems: OrderItem[] = [];

    for (const item of input.items) {
      const food = await this.foodRepository.findById(item.foodId);
      
      if (!food) {
        throw new DomainError(`Alimento ${item.foodId} não encontrado`);
      }

      if (!food.available) {
        throw new DomainError(`Alimento ${food.name} não está disponível`);
      }

      const orderItem = OrderItem.create(
        food.id,
        food.name,
        item.quantity,
        food.price,
        item.notes
      );

      orderItems.push(orderItem);
    }

    const order = Order.create(
      input.userId,
      orderItems,
      input.deliveryAddress,
      input.deliveryNotes
    );

    await this.orderRepository.save(order);

    const event = new OrderCreatedEvent(
      order.id,
      user.id,
      user.name,
      order.totalAmount,
      order.totalFormatted,
      order.itemCount,
      order.items.map(item => ({
        foodName: item.foodName,
        quantity: item.quantity,
      })),
      order.deliveryAddress,
      new Date()
    );

    this.orderCreatedHandler.handle(event).catch(err => {
      console.error('Erro ao processar evento de novo pedido:', err);
    });

    return {
      orderId: order.id,
      status: order.status,
      totalAmount: order.totalAmount,
      totalFormatted: order.totalFormatted,
      itemCount: order.itemCount,
      estimatedDeliveryTime: order.estimatedDeliveryTime,
      createdAt: order.createdAt,
    };
  }
}