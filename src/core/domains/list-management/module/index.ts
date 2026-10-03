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
import {
  FilterProjection,
  ListReadModel,
  QuizProjection,
  ShareProjection,
} from '../projections/ListProjections'
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

  projections: [
    ListReadModel,
    QuizProjection,
    FilterProjection,
    ShareProjection,
  ],

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
  FilterProjection,
  IDomainEventBus,
  IListRepository,
  List,
  ListCreatedEvent,
  ListDeletedEvent,
  ListId,
  ListManagementService,
  ListName,
  ListReadModel,
  ListUpdatedEvent,
  QuizProjection,
  Selection,
  SelectionChangedEvent,
  ShareProjection,
  UserRole,
}
