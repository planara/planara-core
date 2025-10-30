// IOC
import { inject, injectable, injectAll } from 'tsyringe';
// Interfaces
import type { IHandler } from '../../interfaces/handler/handler';
import type { IToolHandler } from '../../interfaces/handler/tool-handler';
import type { IToolManager } from '../../interfaces/manager/tool-manager';
import type { IEditorStore } from '../../interfaces/store/editor-store';
// Types
import { ToolType } from '@planara/types';

@injectable()
export class ToolManager implements IToolManager {
  /** Текущий выбранный инструмент */
  private _currentTool: ToolType = ToolType.Translate;

  /** Хендлеры, которые управляют инструментами */
  private readonly _handlers: Map<ToolType, IHandler>;

  private readonly _unsubSelected?: () => void;

  public constructor(
    @injectAll('IToolHandler') handlers: IToolHandler[],
    @inject('IEditorStore') private _store: IEditorStore,
  ) {
    // Получение хендлеров
    this._handlers = new Map(handlers.map((h) => [h.mode, h]));

    // Подписка на обновление выбранного объекта на сцене
    this._unsubSelected = this._store.onSelectedObjectChange(() => {
      this._handlers.get(this._currentTool)?.handle();
    });
  }

  public manage(tool: ToolType): void {
    if (this._currentTool === tool) return;

    // Отключение предыдущего инструмента
    this._handlers.get(this._currentTool)?.rollback();

    // Сохранение нового инструмента, для отката при выборе нового
    this._currentTool = tool;
    this._store.setToolType(this._currentTool);

    // Используем выбранный инструмент
    this._handlers.get(this._currentTool)?.handle();
  }

  /** Освобождает ресурсы менеджера. */
  public dispose(): Promise<void> | void {
    this._unsubSelected?.();
    // Очистка хендлеров
    if (this._handlers) {
      this._handlers.clear();
    }

    // Возвращение дефолтного значения
    this._currentTool = ToolType.Translate;
    this._store.setToolType(this._currentTool);
  }
}
