// IOC
import { inject, injectable, injectAll } from 'tsyringe';
// Interfaces
import type { IHandler, IToolHandler } from '@/interfaces/handler';
import type { IToolManager } from '@/interfaces/manager';
import type { ITransformStore } from '@/interfaces/store';
import type { IPolicy } from '@/interfaces/policy';
// Types
import { ToolType } from '@planara/types';
import { FeatureType } from '@/types/feature';
// Policy
import { usePolicy } from '@/shared/decorators';

@injectable()
export class ToolManager implements IToolManager {
  /** Текущий выбранный инструмент */
  private _currentTool: ToolType = ToolType.Translate;

  /** Хендлеры, которые управляют инструментами */
  private readonly _handlers: Map<ToolType, IHandler>;

  /** Событие обновления выбора объекта */
  private readonly _unsubSelected?: () => void;

  /** Тип фичи, за которую отвечает менеджер. */
  public type: FeatureType = FeatureType.Tool;

  public constructor(
    @injectAll('IToolHandler') handlers: IToolHandler[],
    @inject('EditorStore') private _store: ITransformStore,
    @inject('ToolPolicy') private _policy: IPolicy,
  ) {
    // Получение хендлеров
    this._handlers = new Map(handlers.map((h) => [h.mode, h]));

    // Подписка на обновление выбранного объекта на сцене
    this._unsubSelected = this._store.onSelectedObjectChange(() => {
      this._handlers.get(this._currentTool)?.handle();
    });
  }

  @usePolicy((self) => self._policy)
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
