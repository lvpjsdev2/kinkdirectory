export type KinkChoice = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type KinkPosition = 'general' | 'as_dom' | 'as_sub' | 'for_dom' | 'for_sub';

export interface SelectionKey {
  kinkKey: number;
  position: KinkPosition;
}

export class Selection {
  private readonly kinkKey: number;
  private readonly position: KinkPosition;
  private readonly choice: KinkChoice;

  constructor(kinkKey: number, position: KinkPosition, choice: KinkChoice) {
    if (kinkKey <= 0) {
      throw new Error('Kink key must be positive');
    }
    if (!['general', 'as_dom', 'as_sub', 'for_dom', 'for_sub'].includes(position)) {
      throw new Error(`Invalid position: ${position}`);
    }
    if (![0, 1, 2, 3, 4, 5, 6].includes(choice)) {
      throw new Error(`Invalid choice: ${choice}`);
    }
    this.kinkKey = kinkKey;
    this.position = position;
    this.choice = choice;
  }

  static create(kinkKey: number, position: KinkPosition, choice: KinkChoice): Selection {
    return new Selection(kinkKey, position, choice);
  }

  static fromKeyString(keyString: string): Selection | null {
    try {
      const [kinkKeyStr, position] = keyString.split('%');
      const kinkKey = Number.parseInt(kinkKeyStr, 10);
      const choice = Number.parseInt(position.split(',')[1] || '0', 10);
      // This is a simplified version - actual parsing is more complex
      return null;
    } catch {
      return null;
    }
  }

  getKinkKey(): number {
    return this.kinkKey;
  }

  getPosition(): KinkPosition {
    return this.position;
  }

  getChoice(): KinkChoice {
    return this.choice;
  }

  isUnrated(): boolean {
    return this.choice === 0;
  }

  toKeyString(): string {
    return `${this.kinkKey}%${this.position}`;
  }

  equals(other: Selection): boolean {
    return this.kinkKey === other.kinkKey
      && this.position === other.position
      && this.choice === other.choice;
  }

  withChoice(choice: KinkChoice): Selection {
    return new Selection(this.kinkKey, this.position, choice);
  }
}