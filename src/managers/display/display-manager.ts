// IOC
import { injectable, injectAll } from 'tsyringe';
// Interfaces
import type { IDisplayManager } from '../../interfaces/manager/display-manager';
import type { IHandler } from '../../interfaces/handler/handler';
// Types
import { DisplayMode } from '@planara/types';
import type { IDisplayHandler } from '../../interfaces/handler/display-handler';

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

  constructor(@injectAll('IDisplayHandler') handlers: IDisplayHandler[]) {
    console.log('displayManager');
    this._handlers = new Map(handlers.map((h) => [h.mode, h]));
  }

  /** Установка режима отображения */
  manage(mode: DisplayMode): void {
    if (mode === this._currentMode) return;

    // Откат текущего режима
    this._handlers.get(this._currentMode)?.rollback();

    // Для plane - просто откат всех хендлеров
    if (mode !== DisplayMode.Plane) {
      this._handlers.get(mode)?.handle();
    }

    this._currentMode = mode;
  }

  /** Освобождение ресурсов */
  destroy(): void {
    if (this._handlers) {
      this._handlers.clear();
    }

    this._currentMode = DisplayMode.Plane;
  }
}
