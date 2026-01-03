export class FoodReadyEvent {
  constructor(
    public readonly foodId: string,
    public readonly foodName: string,
    public readonly foodDescription: string,
    public readonly price: number,
    public readonly priceFormatted: string,
    public readonly imageUrl: string | null,
    public readonly preparationType: 'oven' | 'fried' | 'grilled' | 'cooked' | 'baked',
    public readonly markedBy: string,
    public readonly markedByName: string,
    public readonly occurredAt: Date = new Date()
  ) {}

  getNotificationMessage(): string {
    const typeMessages: Record<string, string> = {
      oven: '🔥 acabou de sair do forno!',
      fried: '🍳 acabou de ser fritado!',
      grilled: '🔥 acabou de sair da grelha!',
      cooked: '🍲 acabou de ser cozido!',
      baked: '🥐 acabou de ser assado!',
    };
    const typeMsg = typeMessages[this.preparationType] || 'está fresquinho!';
    return `${this.foodName} ${typeMsg} Peça agora! 😋`;
  }

  getNotificationTitle(): string {
    return '🔥 Fresquinho Saindo!';
  }

  shouldBroadcastToAll(): boolean {
    return true;
  }
}