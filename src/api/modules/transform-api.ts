// Core
import * as THREE from 'three';
// Types
import type { ToolType } from '@planara/types';
import type { TransformListener } from '../../types/listener/transform-listener';
// IOC
import { inject, injectable } from 'tsyringe';
// Interfaces
import type { ITransformApi } from '../../interfaces/api/transform-api';

/**
 * API для управления трансформацией объектов (гизмо).
 *
 * **Назначение:**
 * - Предоставляет хендлерам инструментов унифицированный интерфейс для работы с гизмо
 * - Скрывает конкретную реализацию {@link `ControlsModule`}
 *
 * **Используется:**
 * - Хендлерами инструментов:
 *   - {@link `TranslateToolHandler`} — перемещение
 *   - {@link `RotateToolHandler`} — вращение
 *   - {@link `ScaleToolHandler`} — масштабирование
 *
 * @see {@link ITransformApi} - интерфейс, который реализует этот класс
 * @see {@link ControlsModule} - реальная реализация операций трансформации
 *
 * @internal
 * @class
 */
@injectable()
export class TransformApi implements ITransformApi {
  /** @constructor */
  public constructor(@inject('ControlsModule') private readonly _controlsModule: ITransformApi) {}

  public attachTransform(object: THREE.Object3D): void {
    this._controlsModule.attachTransform(object);
  }

  public detachTransform(): void {
    this._controlsModule.detachTransform();
  }

  public setTransformMode(mode: ToolType): void {
    this._controlsModule.setTransformMode(mode);
  }

  public onTransformChange(callback: TransformListener): () => void {
    return this._controlsModule.onTransformChange(callback);
  }
}
