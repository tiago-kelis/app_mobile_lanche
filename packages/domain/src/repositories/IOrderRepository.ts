import { Order } from '../entities/Order';
import { OrderStatusType } from '../value-objects/OrderStatus';

export interface IOrderRepository {
  save(order: Order): Promise<void>;
  findById(id: string): Promise<Order | null>;
  findByUserId(userId: string): Promise<Order[]>;
  findByStatus(status: OrderStatusType): Promise<Order[]>;
  findActiveOrders(): Promise<Order[]>;
  findAll(): Promise<Order[]>;
  delete(id: string): Promise<void>;
}