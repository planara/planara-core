// Interfaces
import type { ISelectHandler } from '../../interfaces/handler/select-handler';
import type { ISelectManager } from '../../interfaces/manager/select-manager';
import type { IHandler } from '../../interfaces/handler/handler';
// IOC
import { inject, injectable, injectAll } from 'tsyringe';
// Events
import type { EventBus } from '../../events/event-bus';
import { EventTopics } from '../../events/event-topics';
import type { EditorEvents } from '../../events/editor-events';
import { SelectEventType } from '../../types/event/select-event-type';
// Types
import { SelectMode } from '@planara/types';

@injectable()
export class SelectManager implements ISelectManager {
  /** Текущий режим выборки */
  private _currentMode: SelectMode = SelectMode.Mesh;

  /** Хендлеры, которые управляют выборкой */
  private readonly _handlers: Map<SelectMode, IHandler>;

  public constructor(
    @inject('EventBus') private _eventBus: EventBus,
    @injectAll('ISelectHandler') handlers: ISelectHandler[],
  ) {
    // Получение хендлеров
    this._handlers = new Map(handlers.map((h) => [h.mode, h]));

    // Подписка на события
    this._eventBus.on(EventTopics.SelectHover, this._onHover);
    this._eventBus.on(EventTopics.SelectClick, this._onClick);
  }

  public manage(mode: SelectMode): void {
    if (mode === this._currentMode) return;

    // Если поменялся режим, то надо сделать откат предыдущего хендлера
    this._handlers.get(this._currentMode)?.rollback();

    // Сохранение текущего режима
    this._currentMode = mode;
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
    // Отправка события выбора модели
    const mesh = payload?.mesh ?? null;
    this._eventBus.emit(EventTopics.ToolSelect, { mode: this._currentMode, mesh: mesh });

    // Получение хендлера под нужный режим
    const handler = this._handlers.get(this._currentMode);

    // Обработка события
    handler?.handle(payload, SelectEventType.Click);
  };

  public destroy(): void {
    // Очистка хендлеров
    if (this._handlers) {
      this._handlers.clear();
    }

    // Отписка от событий
    this._eventBus.off(EventTopics.SelectHover, this._onHover);
  }
}
