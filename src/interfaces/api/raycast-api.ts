// Types
import type { SelectMode } from '@planara/types';

/**
 * Публичный API для конфигурации Raycaster в редакторе.
 *
 * Хэндлеры получают единый `Intersection`, а текущий режим
 * определяет, какие объекты участвуют в пиккинге и какие пороги
 * используются:
 * Настройка режима может меняться на лету, перед любым вызовом `raycaster.intersectObjects`.
 * @internal
 */
export interface IRaycastAPI {
  /**
   * Устанавливает режим работы Raycaster и связанные с ним таргеты/пороговые параметры.
   *
   * **Поведение по режимам:**
   * - `Mesh`/`Face`
   * - `Edge`
   * - `Vertex`
   * @param mode Текущий режим выбора (`Mesh | Face | Edge | Vertex`).
   */
  setRaycastMode(mode: SelectMode): void;
}
