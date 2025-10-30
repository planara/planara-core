// IOC
import { inject, injectable, injectAll } from 'tsyringe';
// Interfaces
import type { IDisplayManager } from '../../interfaces/manager/display-manager';
import type { IHandler } from '../../interfaces/handler/handler';
import type { IDisplayHandler } from '../../interfaces/handler/display-handler';
import type { IEditorStore } from '../../interfaces/store/editor-store';
// Types
import { DisplayMode } from '@planara/types';

/**
 * Менеджер для управления отображением
 * @internal
 */
@injectable()
export class DisplayManager implements IDisplayManager {
  /** Текущий режим отображения */
  private _currentMode: DisplayMode = DisplayMode.Plane;

  /** Хендлеры, которые управляют отображением */
  private readonly _handlers: Map<DisplayMode, IHandler>;

  public constructor(
    @injectAll('IDisplayHandler') handlers: IDisplayHandler[],
    @inject('IEditorStore') private _store: IEditorStore,
  ) {
    this._handlers = new Map(handlers.map((h) => [h.mode, h]));
  }

  /** Установка режима отображения */
  public manage(mode: DisplayMode): void {
    if (mode === this._currentMode) return;

    // Откат текущего режима
    this._handlers.get(this._currentMode)?.rollback();

    // Для plane - просто откат всех хендлеров
    if (mode !== DisplayMode.Plane) {
      this._handlers.get(mode)?.handle();
    }

    // Сохранение текущего режима
    this._currentMode = mode;
    this._store.setDisplayMode(this._currentMode);
  }

  /** Освобождает ресурсы менеджера. */
  public dispose(): Promise<void> | void {
    // Очистка хендлеров
    if (this._handlers) {
      this._handlers.clear();
    }

    // Возвращение дефолтного значения
    this._currentMode = DisplayMode.Plane;
    this._store.setDisplayMode(this._currentMode);
  }
}
