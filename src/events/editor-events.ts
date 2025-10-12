// Core
import type { Mesh } from 'ogl';
// Topics
import { EventTopics } from './event-topics';

/**
 * Типы событий редактора.
 * Используются в EventEmitter для типизированной публикации и подписки на события.
 * @public
 */
export type EditorEvents = {
  /** Событие наведения на объект (hover). Payload: объект с mesh или null */
  [EventTopics.SelectHover]: { mesh: Mesh } | null;

  /** Событие клика по объекту. Payload: объект с mesh или null */
  [EventTopics.SelectClick]: { mesh: Mesh } | null;
};
