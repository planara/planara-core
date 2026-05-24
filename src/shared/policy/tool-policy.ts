// IOC
import { inject, injectable } from 'tsyringe';
// Interfaces
import type { IPolicy } from '@/interfaces/policy';
import type { ISelectStore } from '@/interfaces/store';
// Types
import { DEFAULT_TOOL_RULES, type ToolType } from '@planara/types';
import { ResponseType } from '@planara/types';
// Errors
import { PolicyError } from '@/shared/errors';

/**
 * Политика управления инструментами.
 *
 * @remarks
 * Используется для контроллирования доступности инструментами в зависимости от выбранного режима редактирования.
 *
 * @public
 * @class
 */
@injectable()
export class ToolPolicy implements IPolicy {
  public constructor(@inject('EditorStore') private _store: ISelectStore) {}

  public check(tool: ToolType): void {
    const selection = this._store.getSelectMode();

    const allowed = DEFAULT_TOOL_RULES[selection].includes(tool);

    if (!allowed) {
      throw new PolicyError(
        ResponseType.NotAllowed,
        `Tool ${tool} is not allowed`,
        'TOOL_NOT_ALLOWED',
      );
    }
  }
}
