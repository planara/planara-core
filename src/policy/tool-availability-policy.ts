// Types
import { type SelectMode, type ToolType, DEFAULT_TOOL_RULES } from '@planara/types';
// Interfaces
import type { IToolAvailabilityPolicy } from '../interfaces/policy/tool-availability-policy';

/**
 * Политика доступности инструментов, в зависимости от режима выборки
 * @internal
 */
export class ToolAvailabilityPolicy implements IToolAvailabilityPolicy {
  /** Доступен ли инструмент при текущем режиме выборки */
  public isToolEnabled(tool: ToolType, selection: SelectMode): boolean {
    return DEFAULT_TOOL_RULES[selection].includes(tool);
  }

  /** Получение доступных инструментов для режима выборки*/
  public getEnabledTools(selection: SelectMode): ToolType[] {
    return DEFAULT_TOOL_RULES[selection];
  }
}
