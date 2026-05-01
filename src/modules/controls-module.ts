// Core
import * as THREE from 'three';
// IOC
import { inject, injectable } from 'tsyringe';
// Interfaces
import type {
  ITransformApi,
  IControlsStateApi,
  ISceneApi,
  IDomApi,
  ICameraApi,
} from '@/interfaces/api';
import type { IUpdatableModule } from '@/interfaces/module';
// Types
import type { ToolType } from '@planara/types';
import type { TransformListener } from '@/types/listener';
// Extensions
import { ModelingTransformControls, OrbitWithState } from '@planara/three';
// Helpers
import { markAsNotExportable } from '@/utils';

/**
 * Модуль управления камерой и трансформацией объектов.
 *
 * @remarks
 * Отвечает за:
 * - управление камерой (OrbitControls) — вращение, панорамирование, масштабирование
 * - управление гизмо (TransformControls) — перемещение, вращение, масштабирование объектов
 *
 * Модуль реализует:
 * - `IRuntimeModule` — жизненный цикл (init/dispose)
 * - `IUpdatableModule` — обновление состояния каждый кадр (update)
 * - `IControlsApi` — публичное API для управления контролами
 * - `IControlsStateApi` — публичное API для получения состояния контролов
 *
 * @see {@link ITransformApi} - публичное API для управления
 * @see {@link IControlsStateApi} - публичное API для получения состояния
 * @see {@link OrbitWithState} - расширенный OrbitControls
 * @see {@link ModelingTransformControls} - расширенный TransformControls
 *
 * @internal
 * @class
 */
@injectable()
export class ControlsModule implements IUpdatableModule, ITransformApi, IControlsStateApi {
  /** Orbit-контроллер для управления камерой */
  private _orbit: OrbitWithState | null = null;

  /** Transform-контроллер для редактирования */
  private _transform: ModelingTransformControls | null = null;
  private _transformHelper: THREE.Object3D | null = null;
  private _transformListeners = new Set<TransformListener>();

  /** Были ли инициализированы обработчики событий (hover/click) */
  private _isEventListenersAdded = false;

  public constructor(
    @inject('ICameraApi') private _cameraApi: ICameraApi,
    @inject('IDomApi') private _domApi: IDomApi,
    @inject('ISceneApi') private _sceneApi: ISceneApi,
  ) {}

  public init(): void {
    // Orbit
    this._orbit = new OrbitWithState(this._cameraApi.getCamera(), this._domApi.getDomElement());
    this._orbit.enableDamping = true;
    this._orbit.dampingFactor = 0.05;

    // Transform
    this._transform = new ModelingTransformControls(
      this._cameraApi.getCamera(),
      this._domApi.getDomElement(),
    );
    this._transformHelper = this._transform.getHelper();
    this._sceneApi.addToScene(markAsNotExportable(this._transformHelper));

    // Инициализация обработчиков событий
    this._initMouseListeners();
  }

  public attachTransform(object: THREE.Object3D): void {
    this._transform?.attach(object);
  }

  public detachTransform(): void {
    this._transform?.detach();
  }

  public update(): void {
    this._orbit?.update();
  }

  public setTransformMode(mode: ToolType): void {
    this._transform?.setMode(mode);
  }

  public onTransformChange(callback: TransformListener): () => void {
    this._transformListeners.add(callback);
    return () => this._transformListeners.delete(callback);
  }

  public isOrbitInteracting(): boolean {
    return !!this._orbit?.isInteracting;
  }

  public isTransformDragging(): boolean {
    return !!this._transform?.dragging;
  }

  private readonly _handlePointerDown = (event: PointerEvent) => {
    this._transform?.pointerDown(event);
  };

  private readonly _handlePointerMove = (event: PointerEvent) => {
    this._transform?.pointerMove(event);
  };

  private readonly _handlePointerUp = (event: PointerEvent) => {
    this._transform?.pointerUp(event);
  };

  private readonly _handlePointerLeave = () => {
    this._transform?.pointerHover(null);
  };

  private readonly _handleDraggingChanged = () => {
    if (!this._orbit) {
      return;
    }

    this._orbit.enabled = !this._transform?.dragging;
  };

  private readonly _handleObjectChange = () => {
    for (const callback of this._transformListeners) {
      callback();
    }
  };

  /** Инициализация обработчиков событий на hover/click */
  private _initMouseListeners() {
    const canvas = this._domApi.getCanvas();

    if (!this._transform || !this._orbit) return;

    // transform controls
    canvas.addEventListener('pointerdown', this._handlePointerDown);
    canvas.addEventListener('pointermove', this._handlePointerMove);
    canvas.addEventListener('pointerup', this._handlePointerUp);
    canvas.addEventListener('pointerleave', this._handlePointerLeave);

    this._transform.addEventListener('dragging-changed', this._handleDraggingChanged);
    this._transform.addEventListener('objectChange', this._handleObjectChange);

    this._isEventListenersAdded = true;
  }

  /** Освобождает ресурсы модуля */
  public dispose(): Promise<void> | void {
    // Очистка обработчиков событий
    if (this._isEventListenersAdded) {
      const canvas = this._domApi.getCanvas();

      if (!this._transform || !this._orbit) return;

      // transform controls
      canvas.removeEventListener('pointerdown', this._handlePointerDown);
      canvas.removeEventListener('pointermove', this._handlePointerMove);
      canvas.removeEventListener('pointerup', this._handlePointerUp);
      canvas.removeEventListener('pointerleave', this._handlePointerLeave);

      this._transform.removeEventListener('dragging-changed', this._handleDraggingChanged);
      this._transform.removeEventListener('objectChange', this._handleObjectChange);

      this._transformListeners.clear();

      this._isEventListenersAdded = false;
    }

    // Очистка хелперов
    this._orbit?.dispose();
    this._orbit = null;

    this._transform?.dispose();
    this._transform = null;

    if (this._transformHelper?.parent) {
      this._transformHelper.parent.remove(this._transformHelper);
    }
  }
}
