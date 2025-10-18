// Interfaces
import type { IHandler } from './handler';
// Types
import type { SelectMode } from '@planara/types';

/**
 * Маркерный интерфейс для всех Select-хендлеров.
 * Используется только для DI.
 *
 * Расширяет {@link IHandler} и добавляет поле `mode`
 * @internal
 */
export interface ISelectHandler extends IHandler {
  /** Режим выборки, за который отвечает хендлер */
  mode: SelectMode;
}
