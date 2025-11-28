// IOC
import { injectable, injectAll } from 'tsyringe';
// Interfaces
import type { IHandler } from '../../interfaces/handler/handler';
import type { ISceneManager } from '../../interfaces/manager/scene-manager';
import type { ISceneHandler } from '../../interfaces/handler/scene-handler';
// Types
import { type FigureType, SceneMode } from '@planara/types';

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

  public constructor(@injectAll('ISceneHandler') handlers: ISceneHandler[]) {
    this._handlers = new Map(handlers.map((h) => [h.mode, h]));
  }

  /** Установка режима редактирования сцены */
  public manage(mode: SceneMode, figure?: FigureType): void {
    // Применение нового режима
    if (mode === SceneMode.AddFigure) this._handlers.get(mode)?.handle(figure);
    else this._handlers.get(mode)?.handle();

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
