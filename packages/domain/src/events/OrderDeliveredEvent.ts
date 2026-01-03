export class OrderDeliveredEvent {
  constructor(
    public readonly orderId: string,
    public readonly userId: string,
    public readonly userName: string,
    public readonly totalAmount: number,
    public readonly totalFormatted: string,
    public readonly deliveredBy: string, // USER que confirmou entrega
    public readonly deliveryAddress: string,
    public readonly orderCreatedAt: Date,
    public readonly deliveredAt: Date = new Date()
  ) {}

  getNotificationMessage(): string {
    return `Pedido #${this.orderId.substring(0, 8)} foi entregue! 🎉 Obrigado pela preferência!`;
  }

  getNotificationTitle(): string {
    return 'Pedido Entregue! 🎉';
  }

  shouldNotifyAdmins(): boolean {
    return true; // Admins precisam saber quando pedidos são entregues
  }

  shouldNotifyUser(): boolean {
    return false; // User foi quem confirmou, não precisa notificar
  }

  getDeliveryTime(): number {
    // Retorna tempo de entrega em minutos
    const diffMs = this.deliveredAt.getTime() - this.orderCreatedAt.getTime();
    return Math.floor(diffMs / 60000);
  }

  wasDeliveredOnTime(): boolean {
    const deliveryTimeMinutes = this.getDeliveryTime();
    return deliveryTimeMinutes <= 60; // Considera entrega no prazo se <= 60 minutos
  }

  getAdminNotificationMessage(): string {
    const deliveryTime = this.getDeliveryTime();
    const onTime = this.wasDeliveredOnTime() ? '✅ No prazo' : '⚠️ Atrasado';
    return `${this.userName} confirmou entrega do pedido #${this.orderId.substring(0, 8)} (${deliveryTime} min) ${onTime}`;
  }
}