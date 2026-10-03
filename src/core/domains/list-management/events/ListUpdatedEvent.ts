import { DomainEvent } from './DomainEvent'

export class ListUpdatedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly changes: {
      name?: string
    },
  ) {
    super(aggregateId)
  }
}
