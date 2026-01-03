export class FoodAvailabilityChangedEvent {
  constructor(
    public readonly foodId: string,
    public readonly foodName: string,
    public readonly foodDescription: string,
    public readonly price: number,
    public readonly priceFormatted: string,
    public readonly imageUrl: string | null,
    public readonly available: boolean,
    public readonly changedBy: string,
    public readonly changedByName: string,
    public readonly reason: string | null,
    public readonly occurredAt: Date = new Date()
  ) {}

  getNotificationMessage(): string {
    if (this.available) {
      return `${this.foodName} está disponível novamente! 🎉 Peça já!`;
    } else {
      return `${this.foodName} está temporariamente indisponível. 😔`;
    }
  }

  getNotificationTitle(): string {
    if (this.available) {
      return '✅ Disponível Agora!';
    } else {
      return '⚠️ Temporariamente Indisponível';
    }
  }

  shouldBroadcastToAll(): boolean {
    // Apenas notificar quando item volta a estar disponível
    return this.available;
  }

  shouldNotifyAdmins(): boolean {
    // Admins sempre são notificados de mudanças de disponibilidade
    return true;
  }

  getAdminNotificationMessage(): string {
    const status = this.available ? 'disponível' : 'indisponível';
    const reasonText = this.reason ? ` Motivo: ${this.reason}` : '';
    return `${this.changedByName} marcou "${this.foodName}" como ${status}.${reasonText}`;
  }

  wasManuallyChanged(): boolean {
    return this.reason !== null && this.reason.length > 0;
  }
}