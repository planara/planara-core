// Types
import { ResponseType } from '@planara/types';

export class PolicyError extends Error {
  private readonly _name: string = 'PolicyException';

  public constructor(
    public readonly type: ResponseType,
    message: string,
    public readonly code?: string,
    public readonly meta?: unknown,
  ) {
    super(message);
    this.name = this._name;
  }
}
