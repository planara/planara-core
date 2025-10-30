// Core
import * as THREE from 'three';
// Topics
import { EventTopics } from './event-topics';
// Types
import type { SelectMode } from '@planara/types';

/**
 * Типы событий редактора.
 * Используются в EventEmitter для типизированной публикации и подписки на события.
 * @public
 */
export type EditorEvents = {
  /** Событие наведения на объект (hover). Payload: объект с пересечениями или null */
  [EventTopics.SelectHover]: { intersection: THREE.Intersection } | null;

  /** Событие клика по объекту. Payload: объект с пересечениями или null */
  [EventTopics.SelectClick]: { intersection: THREE.Intersection } | null;

  /** Событие выбора объекта для редактирования. Payload: выбранный режим выборки */
  [EventTopics.ToolSelect]: { mode: SelectMode; mesh: THREE.Object3D | null };
};
