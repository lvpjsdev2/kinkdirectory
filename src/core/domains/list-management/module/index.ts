import { List } from '../entities/List';
import { ListId } from '../value-objects/ListId';
import { ListName } from '../value-objects/ListName';
import { UserRole } from '../value-objects/UserRole';
import { Selection } from '../value-objects/Selection';
import { IListRepository, LIST_REPOSITORY_TOKEN } from '../repositories/IListRepository';
import { LocalStorageListRepository } from '../repositories/LocalStorageListRepository';
import { ListManagementService } from '../services/ListManagementService';
import { InMemoryDomainEventBus, IDomainEventBus } from '../services/DomainEventBus';
import {
  ListReadModel,
  QuizProjection,
  FilterProjection,
  ShareProjection,
} from '../projections/ListProjections';
import {
  DomainEvent,
  ListCreatedEvent,
  ListUpdatedEvent,
  ListDeletedEvent,
  SelectionChangedEvent,
} from '../events';

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
    { provide: IDomainEventBus, useClass: InMemoryDomainEventBus },
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
};

export type {
  List,
  ListId,
  ListName,
  UserRole,
  Selection,
  IListRepository,
  ListManagementService,
  IDomainEventBus,
  ListReadModel,
  QuizProjection,
  FilterProjection,
  ShareProjection,
  DomainEvent,
  ListCreatedEvent,
  ListUpdatedEvent,
  ListDeletedEvent,
  SelectionChangedEvent,
};