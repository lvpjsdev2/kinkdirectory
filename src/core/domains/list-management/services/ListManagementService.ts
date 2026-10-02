import { List } from '../entities/List';
import { IListRepository } from '../repositories/IListRepository';
import { ListId } from '../value-objects/ListId';
import { DomainEvent } from '../events/DomainEvent';
import { ListCreatedEvent, ListUpdatedEvent, ListDeletedEvent, SelectionChangedEvent } from '../events';

export interface IDomainEventBus {
  publish(event: DomainEvent): Promise<void>;
  subscribe(eventType: string, handler: (event: DomainEvent) => Promise<void>): void;
}

export class ListManagementService {
  constructor(
    private readonly repository: IListRepository,
    private readonly eventBus: IDomainEventBus
  ) {}

  async createList(name: string, role: 'sub' | 'dom' | 'both'): Promise<List> {
    const list = List.create(name, role);
    await this.repository.save(list);
    await this.publishEvents(list);
    return list;
  }

  async updateListName(listId: string, name: string): Promise<List> {
    const id = ListId.create(listId);
    const list = await this.repository.findById(id);
    if (!list) {
      throw new Error(`List not found: ${listId}`);
    }
    list.updateName(name);
    await this.repository.save(list);
    await this.publishEvents(list);
    return list;
  }

  async setSelection(
    listId: string,
    kinkKey: number,
    position: 'general' | 'as_dom' | 'as_sub' | 'for_dom' | 'for_sub',
    choice: 0 | 1 | 2 | 3 | 4 | 5 | 6
  ): Promise<List> {
    const id = ListId.create(listId);
    const list = await this.repository.findById(id);
    if (!list) {
      throw new Error(`List not found: ${listId}`);
    }
    list.setSelection(kinkKey, position, choice);
    await this.repository.save(list);
    await this.publishEvents(list);
    return list;
  }

  async deleteList(listId: string): Promise<void> {
    const id = ListId.create(listId);
    const list = await this.repository.findById(id);
    if (!list) {
      throw new Error(`List not found: ${listId}`);
    }
    await this.repository.delete(id);
    const event = new ListDeletedEvent(listId);
    await this.eventBus.publish(event);
  }

  async getList(listId: string): Promise<List | null> {
    const id = ListId.create(listId);
    return this.repository.findById(id);
  }

  async getAllLists(): Promise<List[]> {
    return this.repository.findAll();
  }

  async getActiveList(activeListId: string | null): Promise<List | null> {
    if (!activeListId) return null;
    return this.getList(activeListId);
  }

  private async publishEvents(list: List): Promise<void> {
    const events = list.getUncommittedEvents();
    for (const event of events) {
      await this.eventBus.publish(event);
    }
    list.markEventsAsCommitted();
  }
}