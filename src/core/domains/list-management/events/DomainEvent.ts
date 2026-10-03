export abstract class DomainEvent {
  public readonly eventId: string;
  public readonly aggregateId: string;
  public readonly occurredOn: Date;
  public readonly eventVersion: number;

  constructor(aggregateId: string) {
    this.eventId = crypto.randomUUID();
    this.aggregateId = aggregateId;
    this.occurredOn = new Date();
    this.eventVersion = 1;
  }
}