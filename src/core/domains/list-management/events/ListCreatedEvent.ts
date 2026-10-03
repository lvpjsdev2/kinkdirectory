import { DomainEvent } from './DomainEvent'

export class ListCreatedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly name: string,
    public readonly role: 'sub' | 'dom' | 'both',
  ) {
    super(aggregateId)
  }
}
