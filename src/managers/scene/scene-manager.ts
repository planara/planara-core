// IOC
import { injectable, injectAll } from 'tsyringe';
// Interfaces
import type { IHandler, ISceneHandler } from '@/interfaces/handler';
import type { ISceneManager } from '@/interfaces/manager';
// Types
import { SceneMode } from '@planara/types';
import { FeatureType } from '@/types/feature';
// Utils
import { disposeAll } from '@/shared/utils';

/**
 * Менеджер для управления сценой
 * @internal
 */
@injectable()
export class SceneManager implements ISceneManager {
  /** Текущий режим редактирования сцены */
  private _currentMode: SceneMode = SceneMode.AddFigure;

  /** Хендлеры, которые управляют отображением */
  private readonly _handlers: Map<SceneMode, IHandler>;

  /** Тип фичи, за которую отвечает менеджер. */
  public type: FeatureType = FeatureType.Scene;

  public constructor(@injectAll('ISceneHandler') handlers: ISceneHandler[]) {
    this._handlers = new Map(handlers.map((h) => [h.mode, h]));
  }

  /** Установка режима редактирования сцены */
  public manage(mode: SceneMode, payload?: unknown): void {
    // TODO: undo/redo через rollback();

    // Применение нового режима
    this._handlers.get(mode)?.handle(payload);

    // Сохранение текущего режима
    this._currentMode = mode;
  }

  /**
   * Очищает таблицу операций со сценой и освобождает их хендлеры.
   *
   * @returns Promise завершения очистки хендлеров сцены
   */
  public dispose(): Promise<void> {
    const handlers = [...this._handlers.values()];
    this._handlers.clear();

    return disposeAll(handlers);
  }
}
