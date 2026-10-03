import type { IListRepository } from '../repositories/IListRepository'
import type { ListId } from '../value-objects/ListId'
import { List } from '../entities/List'

export class LocalStorageListRepository implements IListRepository {
  private readonly storageKey = 'kinklist-lists'

  async save(list: List): Promise<void> {
    const lists = await this.findAll()
    const index = lists.findIndex(l => l.getId().equals(list.getId()))
    const persistence = list.toPersistence()

    if (index >= 0) {
      lists[index] = List.reconstitute(
        persistence.id,
        persistence.name,
        persistence.role,
        persistence.created,
        persistence.selections,
      )
    }
    else {
      lists.push(List.reconstitute(
        persistence.id,
        persistence.name,
        persistence.role,
        persistence.created,
        persistence.selections,
      ))
    }

    await this.persist(lists)
  }

  async findById(id: ListId): Promise<List | null> {
    const lists = await this.findAll()
    return lists.find(l => l.getId().equals(id)) || null
  }

  async findAll(): Promise<List[]> {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (!stored)
        return []
      const data = JSON.parse(stored)
      return data.map((item: any) => List.reconstitute(
        item.id,
        item.name,
        item.role,
        item.created,
        item.selections,
      ))
    }
    catch {
      return []
    }
  }

  async delete(id: ListId): Promise<void> {
    const lists = await this.findAll()
    const filtered = lists.filter(l => !l.getId().equals(id))
    await this.persist(filtered)
  }

  async exists(id: ListId): Promise<boolean> {
    const list = await this.findById(id)
    return list !== null
  }

  private async persist(lists: List[]): Promise<void> {
    const data = lists.map(l => l.toPersistence())
    localStorage.setItem(this.storageKey, JSON.stringify(data))
  }
}
