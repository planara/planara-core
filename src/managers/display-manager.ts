// IOC
import { injectable, injectAll } from 'tsyringe';
// Interfaces
import type { IDisplayManager } from '../interfaces/manager';
import type { IHandler } from '../interfaces/handler';
// Types
import { DisplayMode } from '@planara/types';
import type { IDisplayHandler } from '../interfaces/display-handler';

/**
 * Менеджер для управления отображением
 * @internal
 */
@injectable()
export class DisplayManager implements IDisplayManager {
  /** Текущий режим отображения */
  private currentMode: DisplayMode = DisplayMode.Plane;

  /** Хендлеры, которые управляют отображением */
  private readonly handlers: Map<DisplayMode, IHandler>;

  constructor(@injectAll('IDisplayHandler') handlers: IDisplayHandler[]) {
    this.handlers = new Map(handlers.map((h) => [h.mode, h]));
  }

  /** Установка режима отображения */
  manage(mode: DisplayMode): void {
    if (mode === this.currentMode) return;

    // Откат текущего режима
    this.handlers.get(this.currentMode)?.rollback();

    // Для plane - просто откат всех хендлеров
    if (mode !== DisplayMode.Plane) {
      this.handlers.get(mode)?.handle();
    }

    this.currentMode = mode;
  }

  /** Освобождение ресурсов */
  destroy(): void {
    if (this.handlers) {
      this.handlers.clear();
    }

    this.currentMode = DisplayMode.Plane;
  }
}
