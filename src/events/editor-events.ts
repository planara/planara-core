// Core
import * as THREE from 'three';
// Topics
import { EventTopics } from './event-topics';

/**
 * Типы событий редактора.
 * Используются в EventEmitter для типизированной публикации и подписки на события.
 * @public
 */
export type EditorEvents = {
  /** Событие наведения на объект (hover). Payload: объект с mesh или null */
  [EventTopics.SelectHover]: { mesh: THREE.Object3D } | null;

  /** Событие клика по объекту. Payload: объект с mesh или null */
  [EventTopics.SelectClick]: { mesh: THREE.Object3D } | null;
};
