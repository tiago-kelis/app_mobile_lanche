export class OrderStatusChangedEvent {
  constructor(
    public readonly orderId: string,
    public readonly userId: string,
    public readonly userName: string,
    public readonly oldStatus: string,
    public readonly newStatus: string,
    public readonly newStatusDisplay: string,
    public readonly changedBy: string,
    public readonly changedByName: string,
    public readonly orderTotal: number,
    public readonly orderItems: Array<{ foodName: string; quantity: number }>,
    public readonly occurredAt: Date = new Date()
  ) {}

  getNotificationMessage(): string {
    switch (this.newStatus) {
      case 'PREPARING':
        return `Seu pedido #${this.orderId.substring(0, 8)} está sendo preparado! 👨‍🍳`;
      case 'READY':
        return `Seu pedido #${this.orderId.substring(0, 8)} está pronto! ✅`;
      case 'OUT_FOR_DELIVERY':
        return `Seu pedido #${this.orderId.substring(0, 8)} saiu para entrega! 🚗`;
      case 'DELIVERED':
        return `Pedido #${this.orderId.substring(0, 8)} foi entregue! 🎉`;
      case 'CANCELLED':
        return `Pedido #${this.orderId.substring(0, 8)} foi cancelado.`;
      default:
        return `Status do pedido #${this.orderId.substring(0, 8)} atualizado.`;
    }
  }

  getNotificationTitle(): string {
    switch (this.newStatus) {
      case 'PREPARING': return 'Preparando seu pedido';
      case 'READY': return 'Pedido pronto!';
      case 'OUT_FOR_DELIVERY': return 'Saiu para entrega';
      case 'DELIVERED': return 'Pedido entregue';
      case 'CANCELLED': return 'Pedido cancelado';
      default: return 'Status atualizado';
    }
  }

  shouldNotifyUser(): boolean {
    return true;
  }

  shouldNotifyAdmins(): boolean {
    return this.newStatus === 'DELIVERED' || this.newStatus === 'CANCELLED';
  }
}