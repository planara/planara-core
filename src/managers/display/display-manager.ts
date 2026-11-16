// IOC
import { inject, injectable, injectAll } from 'tsyringe';
// Interfaces
import type { IDisplayManager } from '@/interfaces/manager';
import type { IHandler, IDisplayHandler } from '@/interfaces/handler';
import type { IDisplayStore } from '@/interfaces/store';
// Types
import { DisplayMode } from '@planara/types';
import { FeatureType } from '@/types/feature';
// Utils
import { disposeAll } from '@/shared/utils';

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

  /** Тип фичи, за которую отвечает менеджер. */
  public type: FeatureType = FeatureType.Display;

  public constructor(
    @injectAll('IDisplayHandler') handlers: IDisplayHandler[],
    @inject('EditorStore') private _store: IDisplayStore,
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

  /**
   * Освобождает хендлеры режимов отображения.
   *
   * @remarks
   * Каждый хендлер завершает собственный режим. Менеджер при уничтожении
   * не публикует переключение режима в store.
   *
   * @returns Promise завершения очистки хендлеров отображения
   */
  public dispose(): Promise<void> {
    const handlers = [...this._handlers.values()];
    this._handlers.clear();

    return disposeAll(handlers);
  }
}
