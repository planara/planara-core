/**
 * Топики событий редактора.
 * Используются для подписки/публикации через EventEmitter.
 * @public
 */
export enum EventTopics {
  /** Событие наведения на объект (hover). Payload: intersection: Intersection | null */
  SelectHover = 'select.hover',

  /** Событие клика по объекту. Payload: intersection: Intersection | null */
  SelectClick = 'select.click',

  /** Событие выбора объекта для редактирования. Payload: mode: SelectMode, object: THREE.Object3D | null */
  ToolSelect = 'tool.select',
}
