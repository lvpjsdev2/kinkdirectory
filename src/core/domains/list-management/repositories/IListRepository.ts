import { List } from '../entities/List';
import { ListId } from '../value-objects/ListId';

export interface IListRepository {
  save(list: List): Promise<void>;
  findById(id: ListId): Promise<List | null>;
  findAll(): Promise<List[]>;
  delete(id: ListId): Promise<void>;
  exists(id: ListId): Promise<boolean>;
}

export const LIST_REPOSITORY_TOKEN = Symbol('IListRepository');