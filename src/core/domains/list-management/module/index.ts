import type { IListRepository } from '../repositories/IListRepository'
import type { IDomainEventBus } from '../services/DomainEventBus'
import { List } from '../entities/List'
import {
  DomainEvent,
  ListCreatedEvent,
  ListDeletedEvent,
  ListUpdatedEvent,
  SelectionChangedEvent,
} from '../events'
import { LIST_REPOSITORY_TOKEN } from '../repositories/IListRepository'
import { LocalStorageListRepository } from '../repositories/LocalStorageListRepository'
import { DOMAIN_EVENT_BUS_TOKEN, InMemoryDomainEventBus } from '../services/DomainEventBus'
import { ListManagementService } from '../services/ListManagementService'
import { ListId } from '../value-objects/ListId'
import { ListName } from '../value-objects/ListName'
import { Selection } from '../value-objects/Selection'
import { UserRole } from '../value-objects/UserRole'

export const listManagementModule = {
  name: 'list-management',

  entities: [List],

  valueObjects: [
    ListId,
    ListName,
    UserRole,
    Selection,
  ],

  services: [
    ListManagementService,
    { provide: DOMAIN_EVENT_BUS_TOKEN, useClass: InMemoryDomainEventBus },
  ],

  repositories: [
    { provide: LIST_REPOSITORY_TOKEN, useClass: LocalStorageListRepository },
  ],

  // No projections are registered here: the read side of a List is the one pure
  // projection in src/projection (ADR-0001/0002), and the screen, the Quiz and
  // the export surface are all adapters over that single seam. This module wires
  // writes, persistence and events.

  events: [
    DomainEvent,
    ListCreatedEvent,
    ListUpdatedEvent,
    ListDeletedEvent,
    SelectionChangedEvent,
  ],
}

export { DOMAIN_EVENT_BUS_TOKEN }
export type {
  DomainEvent,
  IDomainEventBus,
  IListRepository,
  List,
  ListCreatedEvent,
  ListDeletedEvent,
  ListId,
  ListManagementService,
  ListName,
  ListUpdatedEvent,
  Selection,
  SelectionChangedEvent,
  UserRole,
}
