// Core
import * as THREE from 'three';
// Events
import type { EventBus } from '../events/event-bus';
// IOC
import { inject, injectable } from 'tsyringe';
// Types
import { SelectMode } from '@planara/types';
import { EventTopics } from '../events/event-topics';
// Interfaces
import type { IRuntimeModule } from '../interfaces/module/runtime-module';
import type { IRaycastApi } from '../interfaces/api/raycast-api';
import type { IDomApi } from '../interfaces/api/dom-api';
import type { ICameraApi } from '../interfaces/api/camera-api';
import type { IMeshApi } from '../interfaces/api/mesh-api';
import type { IControlsStateApi } from '../interfaces/api/controls-state-api';
// Constants
import { LINE_THRESHOLD, POINTS_THRESHOLD } from '../constants/threshold';
import { LINE_LAYER, MESH_LAYER, POINT_LAYER } from '../constants/layers';

/**
 * Runtime-модуль raycast-взаимодействия.
 *
 * Отвечает за:
 * - обработку событий мыши на canvas
 * - raycast по объектам сцены
 * - фильтрацию попаданий по текущему режиму выборки
 * - отправку hover/click событий в event bus
 *
 * @internal
 * @class
 */
@injectable()
export class RaycastModule implements IRuntimeModule, IRaycastApi {
  /**
   * Raycast для получения событий наведения/клика по модели
   *
   * @private
   * @member
   */
  private _raycaster!: THREE.Raycaster;

  /**
   * Курсор мыши
   *
   * @private
   * @member
   */
  private _mouse!: THREE.Vector2;

  /**
   * Ключ последней модели, на которую наводились,
   * необходим для отправки только уникальных событий в event bus
   *
   * @private
   * @member
   */
  private _lastHoverKey: string | null = null;

  /**
   * Текуший режим для raycaster
   *
   * @private
   * @member
   */
  private _currentRaycastMode: SelectMode = SelectMode.Mesh;

  /**
   * Были ли инициализированы обработчики событий (hover/click)
   *
   * @private
   * @member
   */
  private _isEventListenersAdded = false;

  public constructor(
    @inject('IDomApi') private _domApi: IDomApi,
    @inject('ICameraApi') private _cameraApi: ICameraApi,
    @inject('IMeshApi') private _meshApi: IMeshApi,
    @inject('IControlsStateApi') private _controlsState: IControlsStateApi,
    @inject('EventBus') private _bus: EventBus,
  ) {}

  public init(): void {
    this._raycaster = new THREE.Raycaster();
    this._mouse = new THREE.Vector2();

    this._applyRaycastParamsByMode();

    if (!this._isEventListenersAdded) {
      this._initMouseListeners();
      this._isEventListenersAdded = true;
    }
  }

  public setRaycastMode(mode: SelectMode) {
    if (this._currentRaycastMode === mode) return;

    const raycaster = this._raycaster;

    raycaster.params.Line.threshold = 0;
    raycaster.params.Points.threshold = 0;

    this._currentRaycastMode = mode;
    this._lastHoverKey = null;
    this._applyRaycastParamsByMode();
  }

  /** Применяет параметры raycaster в зависимости от текущего режима */
  private _applyRaycastParamsByMode(): void {
    const raycaster = this._raycaster;

    raycaster.params.Line.threshold = 0;
    raycaster.params.Points.threshold = 0;

    switch (this._currentRaycastMode) {
      case SelectMode.Mesh:
      case SelectMode.Face:
        raycaster.layers.set(MESH_LAYER);
        break;

      case SelectMode.Edge:
        raycaster.layers.set(LINE_LAYER);
        raycaster.params.Line.threshold = LINE_THRESHOLD;
        break;

      case SelectMode.Vertex:
        raycaster.layers.set(POINT_LAYER);
        raycaster.params.Points.threshold = POINTS_THRESHOLD;
        break;
    }
  }

  /** Возвращает ближайшее пересечение по текущему положению курсора */
  private _getHitIntersection(e: MouseEvent): THREE.Intersection | null | undefined {
    // Используются ли в данный момент Transform/Orbit Controls
    const isInputAvailable =
      this._controlsState.isOrbitInteracting() || this._controlsState.isTransformDragging();
    // Canvas, в котором работает рендерер
    const canvas = this._domApi.getCanvas();
    // Камера сцены
    const camera = this._cameraApi.getCamera();
    // Фигуры, доступные на сцене
    const meshes = this._meshApi.getMeshes();

    // Если идет взаимодействие с камерой, то hover/click не отслеживается
    if (isInputAvailable) return undefined;

    const rect = canvas.getBoundingClientRect();
    this._mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this._mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this._raycaster.setFromCamera(this._mouse, camera);

    // hit по текущему режиму
    const candidate = this._raycaster.intersectObjects(meshes, true)[0] ?? null;

    // Для mesh/face дополнительная проверка видимости не нужна
    if (
      this._currentRaycastMode === SelectMode.Mesh ||
      this._currentRaycastMode === SelectMode.Face
    ) {
      return candidate;
    }

    // Для edge/vertex нужен отдельный hit по поверхности модели
    const prevMask = this._raycaster.layers.mask;
    this._raycaster.layers.set(MESH_LAYER);

    const surface = this._raycaster.intersectObjects(meshes, true)[0] ?? null;

    this._raycaster.layers.mask = prevMask;

    return this._getVisibleHit(candidate, surface);
  }

  // Hover сравнивается не только по object, но и по режимному ключу попадания.
  // Это нужно для Face/Edge/Vertex режимов, где разные элементы могут принадлежать одному и тому же Object3D.
  /** Вспомогательный метод для получения модели, которую выбрали и отправки события в event bus */
  private _processRaycastEvent(
    e: MouseEvent,
    topic: EventTopics.SelectHover | EventTopics.SelectClick,
    markHit: boolean,
  ) {
    const hitIntersection = this._getHitIntersection(e);
    // Фигуры, доступные на сцене
    const meshes = this._meshApi.getMeshes();
    if (hitIntersection === undefined) return;

    const hitObj: THREE.Object3D | null = hitIntersection?.object ?? null;

    // Hover
    if (markHit) {
      // Если курсор ушел с объекта, hover всегда сбрасываем
      if (!hitIntersection) {
        meshes.forEach((m) => (m.userData.isHit = false));
        this._lastHoverKey = null;
        this._bus.emit(topic, null);
        return;
      }

      const hoverKey = this._makeHoverKey(hitIntersection);

      // Если пересечение изменилось, отправляем новое hover-событие
      if (hoverKey !== this._lastHoverKey) {
        meshes.forEach((m) => (m.userData.isHit = false));
        if (hitObj) hitObj.userData.isHit = true;

        this._lastHoverKey = hoverKey;
        this._bus.emit(topic, { intersection: hitIntersection });
      }

      return;
    }

    // Click
    if (!hitIntersection) return;

    this._bus.emit(topic, { intersection: hitIntersection });
  }

  /** Поиск видимой части меша
   * необходимо это для того, чтобы отправлять только видимые элементы модели, а не все попадания
   */
  private _getVisibleHit(
    candidate: THREE.Intersection | null,
    surface: THREE.Intersection | null,
    eps = 1e-4,
  ): THREE.Intersection | null {
    if (!candidate) return null;
    if (!surface) return candidate;

    return candidate.distance <= surface.distance + eps ? candidate : null;
  }

  /** Строит ключ hover-пересечения с учетом текущего режима выборки */
  private _makeHoverKey(intersection: THREE.Intersection | null): string | null {
    if (!intersection) return null;

    const uuid = intersection.object.uuid;

    switch (this._currentRaycastMode) {
      case SelectMode.Face:
        return `${uuid}:face:${intersection.faceIndex ?? -1}`;

      case SelectMode.Edge:
        return `${uuid}:edge:${Math.floor((intersection.index ?? -1) / 2)}`;

      case SelectMode.Vertex:
        return `${uuid}:vertex:${intersection.index ?? -1}`;

      case SelectMode.Mesh:
      default:
        return `${uuid}:mesh`;
    }
  }

  /** Обработчик события для hover */
  private _handleMouseMove = (e: MouseEvent) => {
    this._processRaycastEvent(e, EventTopics.SelectHover, true);
  };

  /** Обработчик события на click */
  private _handleMouseClick = (e: MouseEvent) => {
    this._processRaycastEvent(e, EventTopics.SelectClick, false);
  };

  /** Обработчик двойного клика */
  private _handleDoubleClick = (e: MouseEvent): void => {
    const hitIntersection = this._getHitIntersection(e);
    if (hitIntersection === undefined) return;

    // Снимаем selection только по dblclick в пустую сцену
    if (!hitIntersection) {
      this._bus.emit(EventTopics.SelectClick, null);
    }
  };

  /** Обработчик ухода курсора с canvas */
  private _handleMouseLeave = (): void => {
    this._lastHoverKey = null;
    this._bus.emit(EventTopics.SelectHover, null);
  };

  /** Инициализация обработчиков событий на hover/click */
  private _initMouseListeners() {
    const canvas = this._domApi.getCanvas();

    // raycasting
    canvas.addEventListener('mousemove', this._handleMouseMove, false);
    canvas.addEventListener('click', this._handleMouseClick, false);
    canvas.addEventListener('dblclick', this._handleDoubleClick, false);
    canvas.addEventListener('mouseleave', this._handleMouseLeave);

    this._isEventListenersAdded = true;
  }

  private _removeMouseListeners(): void {
    const canvas = this._domApi.getCanvas();

    canvas.removeEventListener('mousemove', this._handleMouseMove);
    canvas.removeEventListener('click', this._handleMouseClick);
    canvas.removeEventListener('dblclick', this._handleDoubleClick);
    canvas.removeEventListener('mouseleave', this._handleMouseLeave);
  }

  public dispose(): Promise<void> | void {
    this._removeMouseListeners();
    this._isEventListenersAdded = false;
    this._lastHoverKey = null;
  }
}
