// Types
import type { ToolType } from '@planara/types';
// Listeners
import type { TransformListener } from '../../types/listener/transform-listener';

/**
 * Интерфейс store для менеджеров и хендлеров, которые позволяют работать с Tool фичей,
 * необходим для корректного взаимодействия между группами фичей.
 *
 * Можно получить:
 * - выбранный инструмент
 * - подписаться на изменение трансформации объекта
 *
 * @public
 * @interface
 */
export interface IToolStore {
  /** Возвращает текущий активный инструмент. */
  getToolType(): ToolType;

  /**
   * Устанавливает активный инструмент.
   * @param toolType - Тип инструмента (Translate/Rotate/Scale и т.п.).
   */
  setToolType(toolType: ToolType): void;

  /** Подписывает слушателя на изменения трансформации выбранного объекта. */
  onSelectedTransformChange(cb: TransformListener): () => void;

  /** Уведомляет всех подписчиков о том, что трансформация выбранного объекта изменилась. */
  notifySelectedTransformChange(): void;
}
