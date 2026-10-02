import { KinkDefinition } from '../../../../types';
import { List } from '../entities/List';
import { KinkPosition, KinkChoice } from '../value-objects/Selection';

export interface QuizKinkItem {
  categoryId: string;
  kink: KinkDefinition;
  positions: KinkPosition[];
}

export interface ListProjection {
  getId(): string;
  getName(): string;
  getRole(): 'sub' | 'dom' | 'both';
  getCreated(): number;
  getSelectionCount(): number;
  getUnratedPositionCount(): number;
}

export class ListReadModel implements ListProjection {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly role: 'sub' | 'dom' | 'both',
    public readonly created: number,
    private readonly selections: Map<string, { kinkKey: number; position: KinkPosition; choice: KinkChoice }>
  ) {}

  static fromList(list: List): ListReadModel {
    const selections = new Map<string, { kinkKey: number; position: KinkPosition; choice: KinkChoice }>();
    for (const [key, selection] of list.getSelections()) {
      selections.set(key, {
        kinkKey: selection.getKinkKey(),
        position: selection.getPosition(),
        choice: selection.getChoice(),
      });
    }
    return new ListReadModel(
      list.getId().getValue(),
      list.getName().getValue(),
      list.getRole().getValue(),
      list.getCreated().getTime(),
      selections
    );
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getRole(): 'sub' | 'dom' | 'both' {
    return this.role;
  }

  getCreated(): number {
    return this.created;
  }

  getSelectionCount(): number {
    return this.selections.size;
  }

  getUnratedPositionCount(): number {
    // This would need the full kink list to calculate
    return 0;
  }

  getSelection(kinkKey: number, position: KinkPosition): KinkChoice {
    const key = `${kinkKey}%${position}`;
    return this.selections.get(key)?.choice ?? 0;
  }

  hasSelection(kinkKey: number, position: KinkPosition): boolean {
    const key = `${kinkKey}%${position}`;
    return this.selections.has(key);
  }

  getAllSelections(): ReadonlyMap<string, { kinkKey: number; position: KinkPosition; choice: KinkChoice }> {
    return this.selections;
  }
}

export class QuizProjection {
  constructor(
    private readonly list: ListReadModel,
    private readonly kinkCatalog: KinkDefinition[],
    private readonly isKinkVisible: (kink: KinkDefinition, role: 'sub' | 'dom' | 'both') => boolean,
    private readonly getKinkPositions: (kink: KinkDefinition, role: 'sub' | 'dom' | 'both') => KinkPosition[]
  ) {}

  getVisibleKinks(): QuizKinkItem[] {
    const items: QuizKinkItem[] = [];
    for (const kink of this.kinkCatalog) {
      if (this.isKinkVisible(kink, this.list.getRole())) {
        const positions = this.getKinkPositions(kink, this.list.getRole());
        if (positions.length > 0) {
          items.push({
            categoryId: '', // Would need category info
            kink,
            positions,
          });
        }
      }
    }
    return items;
  }

  getNextUnrated(currentKinkKey: number, currentPosition: KinkPosition): QuizKinkItem | null {
    const visibleKinks = this.getVisibleKinks();
    let found = false;

    for (const item of visibleKinks) {
      for (const position of item.positions) {
        if (found && this.list.getSelection(item.kink.key, position) === 0) {
          return item;
        }
        if (item.kink.key === currentKinkKey && position === currentPosition) {
          found = true;
        }
      }
    }
    return null;
  }

  getProgress(): { completed: number; total: number; percentage: number } {
    const visibleKinks = this.getVisibleKinks();
    let total = 0;
    let completed = 0;

    for (const item of visibleKinks) {
      for (const position of item.positions) {
        total++;
        if (this.list.getSelection(item.kink.key, position) !== 0) {
          completed++;
        }
      }
    }

    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }
}

export class FilterProjection {
  constructor(
    private readonly list: ListReadModel,
    private readonly kinkCatalog: KinkDefinition[],
    private readonly isKinkVisible: (kink: KinkDefinition, role: 'sub' | 'dom' | 'both') => boolean,
    private readonly getKinkPositions: (kink: KinkDefinition, role: 'sub' | 'dom' | 'both') => KinkPosition[],
    private readonly isKinkNew: (kink: KinkDefinition, listCreated: number) => boolean
  ) {}

  shouldShowKink(
    kink: KinkDefinition,
    filters: {
      showOnlyNew: boolean;
      showOnlyUnfilled: boolean;
      choiceFilters: KinkChoice[];
    }
  ): boolean {
    if (!this.isKinkVisible(kink, this.list.getRole())) {
      return false;
    }

    if (filters.showOnlyNew && !this.isKinkNew(kink, this.list.getCreated())) {
      return false;
    }

    const positions = this.getKinkPositions(kink, this.list.getRole());

    if (filters.showOnlyUnfilled) {
      const hasUnfilled = positions.some(pos => this.list.getSelection(kink.key, pos) === 0);
      if (!hasUnfilled) return false;
    }

    if (filters.choiceFilters.length > 0) {
      const hasMatching = positions.some(pos =>
        filters.choiceFilters.includes(this.list.getSelection(kink.key, pos))
      );
      if (!hasMatching) return false;
    }

    return true;
  }

  getFilteredKinks(filters: {
    showOnlyNew: boolean;
    showOnlyUnfilled: boolean;
    choiceFilters: KinkChoice[];
  }): KinkDefinition[] {
    return this.kinkCatalog.filter(kink => this.shouldShowKink(kink, filters));
  }
}

export class ShareProjection {
  constructor(private readonly list: ListReadModel) {}

  encodeToUrl(baseUrl: string): string {
    const nonZeroSelections: Array<{ kinkKey: number; position: KinkPosition; choice: KinkChoice }> = [];
    
    for (const [, selection] of this.list.getAllSelections()) {
      if (selection.choice !== 0) {
        nonZeroSelections.push(selection);
      }
    }

    const CURRENT_VERSION = 1;
    const ROLE_MAP = { both: 0, dom: 1, sub: 2 };
    const POSITION_MAP: Record<KinkPosition, number> = {
      general: 0,
      as_dom: 1,
      as_sub: 2,
      for_dom: 3,
      for_sub: 4,
    };

    const selectionCount = nonZeroSelections.length;
    const bufferSize = 4 + (selectionCount * 2);
    const buffer = new Uint8Array(bufferSize);

    buffer[0] = CURRENT_VERSION;
    buffer[1] = ROLE_MAP[this.list.getRole()];
    buffer[2] = (selectionCount >> 8) & 0xFF;
    buffer[3] = selectionCount & 0xFF;

    let offset = 4;
    for (const selection of nonZeroSelections) {
      const posNum = POSITION_MAP[selection.position] || 0;
      const value = (selection.kinkKey << 6) | (posNum << 3) | selection.choice;
      buffer[offset++] = (value >> 8) & 0xFF;
      buffer[offset++] = value & 0xFF;
    }

    const binaryString = Array.from(buffer).map(b => String.fromCharCode(b)).join('');
    const base64 = btoa(binaryString);
    const urlSafe = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    return `${baseUrl}?list=${urlSafe}`;
  }
}