// Interfaces
import type { IHandler } from './handler';
// Types
import type { DisplayMode } from '@planara/types';

/**
 * Маркерный интерфейс для всех Display-хендлеров.
 * Используется только для DI.
 *
 * Расширяет {@link IHandler} и добавляет поле `mode`
 * @internal
 */
export interface IDisplayHandler extends IHandler {
  mode: DisplayMode;
}
