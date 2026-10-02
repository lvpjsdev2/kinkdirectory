export type UserRoleValue = 'sub' | 'dom' | 'both';

export class UserRole {
  private readonly value: UserRoleValue;

  private constructor(value: UserRoleValue) {
    this.value = value;
  }

  static create(value: UserRoleValue): UserRole {
    if (!['sub', 'dom', 'both'].includes(value)) {
      throw new Error(`Invalid UserRole: ${value}`);
    }
    return new UserRole(value);
  }

  static fromString(value: string): UserRole {
    return UserRole.create(value as UserRoleValue);
  }

  getValue(): UserRoleValue {
    return this.value;
  }

  equals(other: UserRole): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  isBoth(): boolean {
    return this.value === 'both';
  }

  isDom(): boolean {
    return this.value === 'dom';
  }

  isSub(): boolean {
    return this.value === 'sub';
  }
}