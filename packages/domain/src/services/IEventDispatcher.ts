export interface DomainEvent {
  occurredAt: Date;
}

export interface IEventHandler<T extends DomainEvent> {
  handle(event: T): Promise<void>;
}

export interface IEventDispatcher {
  register<T extends DomainEvent>(
    eventType: string,
    handler: IEventHandler<T>
  ): void;

  dispatch<T extends DomainEvent>(
    eventType: string,
    event: T
  ): Promise<void>;

  dispatchAll(events: Array<{ eventType: string; event: DomainEvent }>): Promise<void>;
}

export class InMemoryEventDispatcher implements IEventDispatcher {
  private handlers: Map<string, IEventHandler<any>[]> = new Map();

  register<T extends DomainEvent>(
    eventType: string,
    handler: IEventHandler<T>
  ): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  async dispatch<T extends DomainEvent>(
    eventType: string,
    event: T
  ): Promise<void> {
    const handlers = this.handlers.get(eventType) || [];
    
    for (const handler of handlers) {
      try {
        await handler.handle(event);
      } catch (error) {
        console.error(`Error handling event ${eventType}:`, error);
        // Não propagar erro para não quebrar outros handlers
      }
    }
  }

  async dispatchAll(
    events: Array<{ eventType: string; event: DomainEvent }>
  ): Promise<void> {
    for (const { eventType, event } of events) {
      await this.dispatch(eventType, event);
    }
  }
}