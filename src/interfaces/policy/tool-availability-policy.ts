// Types
import type { SelectMode, ToolType } from '@planara/types';

/**
 * Политика доступности инструментов
 * @internal
 */
export interface IToolAvailabilityPolicy {
  /** Доступен ли инструмент при текущем режиме выборки */
  isToolEnabled(tool: ToolType, selection: SelectMode): boolean;

  /** Получение доступных инструментов для режима выборки*/
  getEnabledTools(selection: SelectMode): ToolType[];
}
