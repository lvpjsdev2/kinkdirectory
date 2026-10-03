export class ListName {
  private readonly value: string

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('ListName cannot be empty')
    }
    if (value.length > 100) {
      throw new Error('ListName cannot exceed 100 characters')
    }
    this.value = value.trim()
  }

  static create(value: string): ListName {
    return new ListName(value)
  }

  getValue(): string {
    return this.value
  }

  equals(other: ListName): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
