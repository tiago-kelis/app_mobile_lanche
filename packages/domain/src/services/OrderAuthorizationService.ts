import { User } from '../entities/User';
import { Order } from '../entities/Order';
import { OrderStatusType } from '../value-objects/OrderStatus';
import { DomainError } from '../errors/DomainError';

export class OrderAuthorizationService {
  static canUpdateStatus(
    user: User,
    order: Order,
    newStatus: OrderStatusType
  ): boolean {
    if (user.canManageOrders()) {
      const managementStatuses = [
        OrderStatusType.PREPARING,
        OrderStatusType.READY,
        OrderStatusType.OUT_FOR_DELIVERY,
      ];
      return managementStatuses.includes(newStatus);
    }

    if (user.canUpdateToDelivered()) {
      return newStatus === OrderStatusType.DELIVERED && order.belongsTo(user.id);
    }

    return false;
  }

  static validateUpdatePermission(
    user: User,
    order: Order,
    newStatus: OrderStatusType
  ): void {
    if (!this.canUpdateStatus(user, order, newStatus)) {
      throw new DomainError('Usuário não tem permissão para atualizar este status');
    }
  }

  static canViewOrder(user: User, order: Order): boolean {
    if (user.canManageOrders()) {
      return true;
    }
    return order.belongsTo(user.id);
  }

  static canCancelOrder(user: User, order: Order): boolean {
    if (user.canManageOrders()) {
      return true;
    }
    return order.belongsTo(user.id) && order.isPending();
  }
}