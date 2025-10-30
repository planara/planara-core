// Interfaces
import type { IHandler } from './handler';
// Types
import type { SceneMode } from '@planara/types';

/**
 * Маркерный интерфейс для всех Scene-хендлеров.
 * Используется только для DI.
 *
 * Расширяет {@link IHandler} и добавляет поле `mode`
 * @internal
 */
export interface ISceneHandler extends IHandler {
  /** Режим редактирования сцены, за который отвечает хендлер */
  mode: SceneMode;
}
