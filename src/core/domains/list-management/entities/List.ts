import { ListId } from './value-objects/ListId';
import { ListName } from './value-objects/ListName';
import { UserRole } from './value-objects/UserRole';
import { Selection, KinkChoice, KinkPosition } from './value-objects/Selection';
import { DomainEvent } from './events/DomainEvent';
import { ListCreatedEvent } from './events/ListCreatedEvent';
import { ListUpdatedEvent } from './events/ListUpdatedEvent';
import { ListDeletedEvent } from './events/ListDeletedEvent';
import { SelectionChangedEvent } from './events/SelectionChangedEvent';

export class List {
  private readonly id: ListId;
  private name: ListName;
  private readonly role: UserRole;
  private readonly created: Date;
  private selections: Map<string, Selection> = new Map();
  private uncommittedEvents: DomainEvent[] = [];

  private constructor(
    id: ListId,
    name: ListName,
    role: UserRole,
    created: Date,
    selections: Map<string, Selection> = new Map()
  ) {
    this.id = id;
    this.name = name;
    this.role = role;
    this.created = created;
    this.selections = selections;
  }

  static create(name: string, role: UserRoleValue): List {
    const id = ListId.generate();
    const listName = ListName.create(name);
    const userRole = UserRole.create(role);
    const created = new Date();

    const list = new List(id, listName, userRole, created);
    list.addEvent(new ListCreatedEvent(id.getValue(), name, role));
    return list;
  }

  static reconstitute(
    id: string,
    name: string,
    role: UserRoleValue,
    created: number,
    selections: Record<string, KinkChoice>
  ): List {
    const listId = ListId.create(id);
    const listName = ListName.create(name);
    const userRole = UserRole.create(role);
    const createdDate = new Date(created);

    const selectionMap = new Map<string, Selection>();
    for (const [key, choice] of Object.entries(selections)) {
      if (choice !== 0) {
        const [kinkKeyStr, position] = key.split('%');
        const kinkKey = Number.parseInt(kinkKeyStr, 10);
        selectionMap.set(key, Selection.create(kinkKey, position as KinkPosition, choice));
      }
    }

    return new List(listId, listName, userRole, createdDate, selectionMap);
  }

  getId(): ListId {
    return this.id;
  }

  getName(): ListName {
    return this.name;
  }

  getRole(): UserRole {
    return this.role;
  }

  getCreated(): Date {
    return this.created;
  }

  getSelections(): ReadonlyMap<string, Selection> {
    return this.selections;
  }

  getSelection(kinkKey: number, position: KinkPosition): Selection | undefined {
    const key = `${kinkKey}%${position}`;
    return this.selections.get(key);
  }

  getSelectionByKey(key: string): Selection | undefined {
    return this.selections.get(key);
  }

  setSelection(kinkKey: number, position: KinkPosition, choice: KinkChoice): void {
    const key = `${kinkKey}%${position}`;
    const previousSelection = this.selections.get(key);

    if (choice === 0) {
      if (previousSelection) {
        this.selections.delete(key);
        this.addEvent(new SelectionChangedEvent(
          this.id.getValue(),
          kinkKey,
          position,
          previousSelection.getChoice(),
          choice
        ));
      }
      return;
    }

    const newSelection = Selection.create(kinkKey, position, choice);
    this.selections.set(key, newSelection);

    this.addEvent(new SelectionChangedEvent(
      this.id.getValue(),
      kinkKey,
      position,
      previousSelection?.getChoice() ?? 0,
      choice
    ));
  }

  updateName(name: string): void {
    const newName = ListName.create(name);
    if (!this.name.equals(newName)) {
      const oldName = this.name.getValue();
      this.name = newName;
      this.addEvent(new ListUpdatedEvent(this.id.getValue(), { name: newName.getValue() }));
    }
  }

  getUncommittedEvents(): DomainEvent[] {
    return [...this.uncommittedEvents];
  }

  markEventsAsCommitted(): void {
    this.uncommittedEvents = [];
  }

  private addEvent(event: DomainEvent): void {
    this.uncommittedEvents.push(event);
  }

  toPersistence(): {
    id: string;
    name: string;
    role: UserRoleValue;
    created: number;
    selections: Record<string, KinkChoice>;
  } {
    const selections: Record<string, KinkChoice> = {};
    for (const [key, selection] of this.selections) {
      selections[key] = selection.getChoice();
    }
    return {
      id: this.id.getValue(),
      name: this.name.getValue(),
      role: this.role.getValue(),
      created: this.created.getTime(),
      selections,
    };
  }
}

type UserRoleValue = 'sub' | 'dom' | 'both';