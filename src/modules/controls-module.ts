// Core
import * as THREE from 'three';
// IOC
import { inject, injectable } from 'tsyringe';
// Interfaces
import type { ITransformApi } from '../interfaces/api/transform-api';
import type { IControlsStateApi } from '../interfaces/api/controls-state-api';
import type { ISceneApi } from '../interfaces/api/scene-api';
import type { IDomApi } from '../interfaces/api/dom-api';
import type { ICameraApi } from '../interfaces/api/camera-api';
import type { IUpdatableModule } from '../interfaces/module/updatable-module';
// Types
import type { ToolType } from '@planara/types';
import type { TransformListener } from '../types/listener/transform-listener';
// Extensions
import { ModelingTransformControls, OrbitWithState } from '@planara/three';

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
    this._sceneApi.addToScene(this._transformHelper);

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

  /** Освобождает ресурсы модуля */
  public dispose(): Promise<void> | void {
    // Очистка обработчиков событий
    if (this._isEventListenersAdded) {
      const canvas = this._domApi.getCanvas();

      if (!this._transform || !this._orbit) return;

      // transform controls
      canvas.removeEventListener('pointerdown', (e) => this._transform?.pointerDown(e));
      canvas.removeEventListener('pointermove', (e) => this._transform?.pointerMove(e));
      canvas.removeEventListener('pointerup', (e) => this._transform?.pointerUp(e));
      canvas.removeEventListener('pointerleave', () => this._transform?.pointerHover(null));

      this._transform.removeEventListener('dragging-changed', () => {
        this._orbit!.enabled = !this._transform?.dragging;
      });

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

  /** Инициализация обработчиков событий на hover/click */
  private _initMouseListeners() {
    const canvas = this._domApi.getCanvas();

    if (!this._transform || !this._orbit) return;

    // transform controls
    canvas.addEventListener('pointerdown', (e) => this._transform?.pointerDown(e));
    canvas.addEventListener('pointermove', (e) => this._transform?.pointerMove(e));
    canvas.addEventListener('pointerup', (e) => this._transform?.pointerUp(e));
    canvas.addEventListener('pointerleave', () => this._transform?.pointerHover(null));

    this._transform.addEventListener('dragging-changed', () => {
      this._orbit!.enabled = !this._transform?.dragging;
    });

    this._transform.addEventListener('objectChange', () => {
      for (const cb of this._transformListeners) cb();
    });

    this._isEventListenersAdded = true;
  }
}
