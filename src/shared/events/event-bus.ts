// Core
import { EventEmitter } from 'events';
// IOC
import { injectable } from 'tsyringe';
// Events
import type { EditorEvents } from '@/shared/events';

/**
 * Событийная шина редактора с типизированными топиками.
 *
 * @remarks
 * Реализует паттерн Publish/Subscribe для слабой связи между компонентами.
 *
 * **Особенности:**
 * - Полная типобезопасность через дженерики (`EditorEvents`)
 * - Отсутствие прямых зависимостей между отправителем и получателем
 * - Централизованное управление событиями
 *
 * **Где используется:**
 * - `RaycasterModule` — публикует события выделения (`SelectHover`, `SelectClick`)
 * - `SelectManager` — подписывается на события выделения
 *
 * @see {@link EditorEvents} - типы событий
 * @see {@link EventTopics} - доступные топики
 *
 * @public
 * @class
 */
@injectable()
export class EventBus {
  /**
   * Внутренний эмиттер событий Node.js.
   *
   * @private
   * @member
   */
  private _emitter!: EventEmitter;

  /** @constructor */
  public constructor() {
    this._emitter = new EventEmitter();
  }

  /**
   * Публикует событие в шину.
   *
   * @param event - название события (из `EventTopics`)
   * @param payload - данные события (тип зависит от события)
   *
   * @typeParam K - ключ события из `EditorEvents`
   *
   * @remarks
   * Все подписчики, зарегистрированные на это событие, получат payload.
   *
   * @example
   * ```typescript
   * // Публикация события клика
   * eventBus.emit(EventTopics.SelectClick, { intersection: hit });
   *
   * // Публикация события сброса выделения
   * eventBus.emit(EventTopics.SelectClick, null);
   * ```
   *
   * @public
   * @method
   */
  public emit<K extends keyof EditorEvents>(event: K, payload: EditorEvents[K]): void {
    this._emitter.emit(event, payload);
  }

  /**
   * Подписывается на событие.
   *
   * @param event - название события (из `EventTopics`)
   * @param listener - функция-обработчик, получающая payload
   *
   * @typeParam K - ключ события из `EditorEvents`
   *
   * @remarks
   * **Важно:** для предотвращения утечек памяти необходимо отписываться от событий
   * в `dispose()` методах компонентов.
   *
   * @example
   * ```typescript
   * // Подписка на событие hover
   * this._eventBus.on(EventTopics.SelectHover, (payload) => {
   *   if (payload) {
   *     this._handleHover(payload.intersection);
   *   } else {
   *     this._clearHover();
   *   }
   * });
   * ```
   *
   * @public
   * @method
   */
  public on<K extends keyof EditorEvents>(
    event: K,
    listener: (payload: EditorEvents[K]) => void,
  ): void {
    this._emitter.on(event, listener);
  }

  /**
   * Отписывается от события.
   *
   * @param event - название события (из `EventTopics`)
   * @param listener - функция-обработчик, которую нужно отписать
   *
   * @typeParam K - ключ события из `EditorEvents`
   *
   * @remarks
   * Для корректной отписки необходимо передать ту же самую функцию,
   * которая использовалась при подписке.
   *
   * @example
   * ```typescript
   * // Сохранение ссылки на обработчик
   * private _handleClick = (payload) => { ... };
   *
   * // Подписка
   * eventBus.on(EventTopics.SelectClick, this._handleClick);
   *
   * // Отписка (в dispose)
   * eventBus.off(EventTopics.SelectClick, this._handleClick);
   * ```
   *
   * @public
   * @method
   */
  public off<K extends keyof EditorEvents>(
    event: K,
    listener: (payload: EditorEvents[K]) => void,
  ): void {
    this._emitter.off(event, listener);
  }
}
