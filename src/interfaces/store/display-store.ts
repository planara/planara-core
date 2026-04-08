// Types
import type { DisplayMode } from '@planara/types';

/**
 * Интерфейс store для менеджеров и хендлеров, которые позволяют работать с Display фичей,
 * необходим для корректного взаимодействия между группами фичей.
 *
 * Можно получить:
 * - текущий режим отображения
 *
 * @public
 * @interface
 */
export interface IDisplayStore {
  /** Возвращает текущий режим отображения. */
  getDisplayMode(): DisplayMode;

  /**
   * Устанавливает режим отображения.
   * @param mode - Режим отображения (зависит от твоего домена).
   */
  setDisplayMode(mode: DisplayMode): void;
}
