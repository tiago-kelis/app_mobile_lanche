export class OrderCreatedEvent {
  constructor(
    public readonly orderId: string,
    public readonly userId: string,
    public readonly userName: string,
    public readonly totalAmount: number,
    public readonly totalFormatted: string,
    public readonly itemCount: number,
    public readonly items: Array<{ foodName: string; quantity: number }>,
    public readonly deliveryAddress: string,
    public readonly occurredAt: Date = new Date()
  ) {}

  getNotificationMessage(): string {
    return `${this.userName} fez um pedido de ${this.totalFormatted} (${this.itemCount} ${
      this.itemCount === 1 ? 'item' : 'itens'
    })`;
  }

  getNotificationTitle(): string {
    return '🔔 Novo Pedido Recebido!';
  }

  shouldNotifyAdmins(): boolean {
    return true;
  }
}