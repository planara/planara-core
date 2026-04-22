/**
 * Топики событий редактора.
 * Используются для подписки/публикации через EventEmitter.
 *
 * @public
 * @enum
 */
export enum EventTopics {
  /** Событие наведения на объект (hover). Payload: intersection: Intersection | null */
  SelectHover = 'select.hover',

  /** Событие клика по объекту. Payload: intersection: Intersection | null */
  SelectClick = 'select.click',
}
