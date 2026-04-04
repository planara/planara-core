// Interfaces
import type { IHandler } from './handler';
// Types
import type { DisplayMode } from '@planara/types';

/**
 * Маркерный интерфейс для всех Display-хендлеров.
 * Используется только для DI.
 *
 * @remarks
 * Расширяет {@link IHandler} и добавляет поле `mode`
 *
 * @internal
 * @interface
 */
export interface IDisplayHandler extends IHandler {
  /**
   * Режим отображения, за который отвечает хендлер.
   *
   * @internal
   * @member
   */
  mode: DisplayMode;
}
