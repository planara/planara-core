// Core
import * as THREE from 'three';
// Types
import type { ToolType } from '@planara/types';

/**
 * Интерфейс для управления transform helper внутри рендерера.
 * @internal
 */
export interface ITransformHelpersApi {
  /**
   * Меняет режим transform helper.
   *
   * @param tool - Режим, который необходимо выбрать.
   */
  setMode(tool: ToolType): void;

  /**
   * Прикрепление transform helper к определенному объекту.
   *
   * @param obj - Объект, к которому необходимо прикрепить transform helper.
   */
  attach(obj: THREE.Object3D): void;

  /**
   * Открепление transform helper от объекта.
   */
  detach(): void;
}
