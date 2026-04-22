// Core
import * as THREE from 'three';
// Topics
import { EventTopics } from './event-topics';

/**
 * Типы событий редактора.
 * Используются в EventEmitter для типизированной публикации и подписки на события.
 *
 * @public
 * @type
 */
export type EditorEvents = {
  /** Событие наведения на объект (hover). Payload: объект с пересечениями или null */
  [EventTopics.SelectHover]: { intersection: THREE.Intersection } | null;

  /** Событие клика по объекту. Payload: объект с пересечениями или null */
  [EventTopics.SelectClick]: { intersection: THREE.Intersection } | null;
};
