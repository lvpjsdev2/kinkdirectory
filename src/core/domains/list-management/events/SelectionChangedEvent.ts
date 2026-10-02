import { DomainEvent } from './DomainEvent';

export type KinkPosition = 'general' | 'as_dom' | 'as_sub' | 'for_dom' | 'for_sub';
export type KinkChoice = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export class SelectionChangedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly kinkKey: number,
    public readonly position: KinkPosition,
    public readonly previousChoice: KinkChoice,
    public readonly newChoice: KinkChoice
  ) {
    super(aggregateId);
  }

  isNewSelection(): boolean {
    return this.previousChoice === 0 && this.newChoice !== 0;
  }

  isRemovedSelection(): boolean {
    return this.previousChoice !== 0 && this.newChoice === 0;
  }

  isChangedSelection(): boolean {
    return this.previousChoice !== 0 && this.newChoice !== 0 && this.previousChoice !== this.newChoice;
  }
}