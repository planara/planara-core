// Interfaces
import type { IHandler } from './handler';
// Types
import type { ToolType } from '@planara/types';

/**
 * Маркерный интерфейс для всех Tool-хендлеров.
 * Используется только для DI.
 *
 * Расширяет {@link IHandler} и добавляет поле `mode`
 * @internal
 */
export interface IToolHandler extends IHandler {
  /** Инструмент, за который отвечает хендлер */
  mode: ToolType;
}
