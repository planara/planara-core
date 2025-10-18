// Core
import * as THREE from 'three';
// Types
import type { ToolType } from '@planara/types';
// Interfaces
import type { ITransformHelpersApi } from '../../interfaces/api/transform-helpers-api';
import type { IToolHandler } from '../../interfaces/handler/tool-handler';

/**
 * Базовый класс для инструментов
 * @internal
 */
export abstract class BaseToolHandler implements IToolHandler {
  abstract readonly mode: ToolType;

  protected constructor(protected api: ITransformHelpersApi) {}

  /**
   * Обновляет состояние инструмента под текущее выделение.
   */
  handle(target: THREE.Object3D | null): void {
    this.api.setMode(this.mode);
    if (target) this.api.attach(target);
    else this.api.detach();
  }

  /**
   * Откатывает локальное состояние инструмента при смене инструмента.
   *
   * Вызывается менеджером перед активацией другого хендлера.
   */
  rollback(): void {
    this.api.detach();
  }

  destroy(): void {
    this.rollback();
  }
}
