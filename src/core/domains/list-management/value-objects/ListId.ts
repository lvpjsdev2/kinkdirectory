export class ListId {
  private readonly value: string;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('ListId cannot be empty');
    }
    this.value = value;
  }

  static create(value: string): ListId {
    return new ListId(value);
  }

  static generate(): ListId {
    // Using nanoid-style generation (8 chars)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return new ListId(result);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: ListId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}