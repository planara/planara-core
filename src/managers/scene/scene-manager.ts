// IOC
import { injectable, injectAll } from 'tsyringe';
// Interfaces
import type { IHandler, ISceneHandler } from '@/interfaces/handler';
import type { ISceneManager } from '@/interfaces/manager';
// Types
import { SceneMode } from '@planara/types';
import { FeatureType } from '@/types/feature';

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

  /** Освобождает ресурсы менеджера. */
  public dispose(): Promise<void> | void {
    // Очистка хендлеров
    if (this._handlers) {
      this._handlers.clear();
    }

    // Возвращение дефолтного значения
    this._currentMode = SceneMode.AddFigure;
  }
}
