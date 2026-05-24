// IOC
import { inject, injectable, injectAll } from 'tsyringe';
// Events
import { type EventBus, EventTopics, type EditorEvents } from '@/shared/events';
// Types
import { SelectMode } from '@planara/types';
import { FeatureType } from '@/types/feature';
import { SelectEventType } from '@/types/event';
// Interfaces
import type { ISelectHandler, IHandler } from '@/interfaces/handler';
import type { ISelectManager } from '@/interfaces/manager';
import type { ISelectStore } from '@/interfaces/store';

/**
 * Менеджер, который управляет режимами выборки.
 * Поддерживает режимы Mesh/Face/Edge/Vertex.
 * Отвечает за hover/select события при наведении/клике на модель.
 */
@injectable()
export class SelectManager implements ISelectManager {
  /** Текущий режим выборки */
  private _currentMode: SelectMode = SelectMode.Mesh;

  /** Хендлеры, которые управляют выборкой */
  private readonly _handlers: Map<SelectMode, IHandler>;

  /** Тип фичи, за которую отвечает менеджер. */
  public type: FeatureType = FeatureType.Select;

  public constructor(
    @inject('EventBus') private _eventBus: EventBus,
    @injectAll('ISelectHandler') handlers: ISelectHandler[],
    @inject('EditorStore') private _store: ISelectStore,
  ) {
    // Получение хендлеров
    this._handlers = new Map(handlers.map((h) => [h.mode, h]));

    // Подписка на события
    this._eventBus.on(EventTopics.SelectHover, this._onHover);
    this._eventBus.on(EventTopics.SelectClick, this._onClick);
  }

  /** Переключает режим выбора */
  public manage(mode: SelectMode): void {
    // Если режим не менялся, то не делаем никаких действий
    if (mode === this._currentMode) return;

    // Если поменялся режим, то надо сделать откат предыдущего хендлера
    this._handlers.get(this._currentMode)?.rollback();

    // Сохранение текущего режима
    this._currentMode = mode;
    this._store.setSelectMode(this._currentMode);
  }

  /** Обработчик события наведения на модель */
  private _onHover = (payload: EditorEvents[EventTopics.SelectHover]) => {
    // Получение хендлера под нужный режим
    const handler = this._handlers.get(this._currentMode);

    // Обработка события
    handler?.handle(payload, SelectEventType.Hover);
  };

  /** Обработчик события клика на модель */
  private _onClick = (payload: EditorEvents[EventTopics.SelectClick]) => {
    // Получение хендлера под нужный режим
    const handler = this._handlers.get(this._currentMode);

    // Обработка события
    handler?.handle(payload, SelectEventType.Click);
  };

  /** Освобождает ресурсы менеджера. */
  public dispose(): Promise<void> | void {
    // Очистка хендлеров
    if (this._handlers) {
      this._handlers.clear();
    }

    // Отписка от событий
    this._eventBus.off(EventTopics.SelectHover, this._onHover);
    this._currentMode = SelectMode.Mesh;
    this._store.setSelectMode(this._currentMode);
  }
}
