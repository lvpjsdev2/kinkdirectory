import { DomainEvent } from './DomainEvent'

export class ListDeletedEvent extends DomainEvent {
  constructor(aggregateId: string) {
    super(aggregateId)
  }
}
