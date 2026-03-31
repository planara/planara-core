// Core
import * as THREE from 'three';
import { Renderer } from './renderer';
// Extensions
import {
  CameraAxesGizmo,
  ModelingTransformControls,
  OrbitWithState,
  SymmetricAxesHelper,
} from '@planara/three';
// IOC
import { inject, injectable } from 'tsyringe';
// Event bus
import { EventBus } from '../events/event-bus';
import { EventTopics } from '../events/event-topics';
// Types
import { type Figure, SelectMode, ToolType } from '@planara/types';
import type { TransformListener } from '../types/listener/transform-listener';
// Constants
import { LINE_THRESHOLD, POINTS_THRESHOLD } from '../constants/threshold';
import { MESH_LAYER } from '../constants/layers';
// Helpers
import { makeLineSegments, makeVertexPoints } from '../utils/helpers';

/**
 * Рендерер для редактора.
 * Добавляет сетку, оси координат и поддержку Orbit для управления камерой.
 * Наследуется от базового Renderer.
 * @public
 */
@injectable()
export class EditorRenderer extends Renderer {
  /** Orbit-контроллер для управления камерой */
  private _orbit!: OrbitWithState;

  /** Transform-контроллер для редактирования */
  private _transform!: ModelingTransformControls;
  private readonly _transformHelper!: THREE.Object3D;

  /** Raycast для получения событий наведения/клика по модели*/
  private readonly _raycaster!: THREE.Raycaster;

  /** Курсор мыши */
  private readonly _mouse!: THREE.Vector2;

  /** Были ли инициализированы обработчики событий (hover/click) */
  private _isEventListenersAdded = false;

  /**
   * Ключ последней модели, на которую наводились,
   * необходима для отправки только уникальных событий в event bus
   */
  private _lastHoverKey: string | null = null;

  private _currentRaycastMode: SelectMode = SelectMode.Mesh;

  /** Gizmo для управления отображением perspective camera */
  private _cameraGizmo!: CameraAxesGizmo;

  private _transformListeners = new Set<TransformListener>();

  public constructor(
    @inject('Canvas') private _canvas: HTMLCanvasElement,
    @inject('EventBus') private _bus: EventBus,
  ) {
    super(_canvas);

    // Сетка
    const grid = new THREE.GridHelper(10, 10);
    grid.position.y = -0.001;
    this.scene.add(grid);

    // Оси
    const axes = new SymmetricAxesHelper(6);
    this.scene.add(axes);

    // Orbit
    this._orbit = new OrbitWithState(this.camera, this.renderer.domElement);
    this._orbit.enableDamping = true;
    this._orbit.dampingFactor = 0.05;

    // Gizmo
    this._cameraGizmo = new CameraAxesGizmo(this.renderer, this.camera, {
      size: 96, // Размер квадрата
      margin: 36, // Отступы по сторонам (снизу и справа)
    });

    // Raycasting
    this._raycaster = new THREE.Raycaster();
    this._mouse = new THREE.Vector2();

    // Освещение
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.6));

    // Настройки для камеры
    this.camera.layers.enable(0);
    this.camera.layers.enable(1);

    // Transform
    this._transform = new ModelingTransformControls(this.camera, this.renderer.domElement);
    this._transformHelper = this._transform.getHelper();
    this.scene.add(this._transformHelper);

    if (!this._isEventListenersAdded) {
      this._initMouseListeners();
    }
  }

  /**
   * Обновление состояния рендерера.
   */
  protected update() {
    this._orbit.update();
  }

  /** Добавление фигуры на сцену */
  public override addFigure(figure: Figure) {
    const mesh = super.addFigure(figure);

    mesh.layers.enable(MESH_LAYER);

    // внешние рёбра
    const line = makeLineSegments(mesh.geometry);
    mesh.add(line);

    const points = makeVertexPoints(mesh.geometry as THREE.BufferGeometry);
    mesh.add(points);

    return mesh;
  }

  /**
   * Смена отображения `TransformControls` в зависимости от типа инструмента.
   * @param mode - тип инструмента для отображения `TransformControls`.
   * @internal
   */
  public setTransformControlsMode(mode: ToolType) {
    this._transform.setMode(mode);
  }

  /**
   * Добавление `TransformControls` к объекту.
   * @param object - объект, к которому добавляются `TransformControls`.
   * @internal
   */
  public attachTransformControls(object: THREE.Object3D) {
    this._transform.attach(object);
  }

  /**
   * Удаление `TransformControls` с последнего выбранного объекта.
   * @internal
   */
  public detachTransformControls() {
    this._transform.detach();
  }

  /**
   * Подписывает слушателя на изменения трансформации текущего объекта.
   * @internal
   */
  public onTransformChange(cb: TransformListener): () => void {
    this._transformListeners.add(cb);
    return () => this._transformListeners.delete(cb);
  }

  /**
   * Настройка режимов для `Raycaster`.
   * @internal
   */
  public setRaycastMode(mode: SelectMode) {
    const raycaster = this._raycaster;

    raycaster.params.Line.threshold = 0;
    raycaster.params.Points.threshold = 0;

    this._currentRaycastMode = mode;
    this._lastHoverKey = null;

    switch (mode) {
      case SelectMode.Mesh:
      case SelectMode.Face:
        raycaster.layers.set(0);
        break;
      case SelectMode.Edge:
        raycaster.layers.set(1);
        raycaster.params.Line.threshold = LINE_THRESHOLD;
        break;
      case SelectMode.Vertex:
        raycaster.layers.set(2);
        raycaster.params.Points.threshold = POINTS_THRESHOLD;
        break;
    }
  }

  public override dispose() {
    // Очистка обработчиков событий
    if (this._isEventListenersAdded) {
      this._canvas.removeEventListener('mousemove', this._handleMouseMove, false);
      this._canvas.removeEventListener('click', this._handleMouseClick, false);
      this._canvas.removeEventListener('dblclick', this._handleDoubleClick, false);

      this._canvas.removeEventListener('pointerdown', (e) => this._transform.pointerDown(e));
      this._canvas.removeEventListener('pointermove', (e) => this._transform.pointerMove(e));
      this._canvas.removeEventListener('pointerup', (e) => this._transform.pointerUp(e));
      this._canvas.removeEventListener('pointerleave', () => this._transform.pointerHover(null));
      this._transform.removeEventListener('dragging-changed', () => {
        this._orbit.enabled = !this._transform.dragging;
      });

      this._transformListeners.clear();

      this._isEventListenersAdded = false;
    }

    // Очистка хелперов
    this._orbit?.dispose();
    this._transform?.dispose();
    if (this._transformHelper?.parent) {
      this._transformHelper.parent.remove(this._transformHelper);
    }

    this._lastHoverKey = null;

    super.dispose();
  }

  protected override render() {
    super.render();

    this._cameraGizmo.render(this._canvas.width, this._canvas.height);
  }

  /** Инициализация обработчиков событий на hover/click */
  private _initMouseListeners() {
    // raycasting
    this._canvas.addEventListener('mousemove', this._handleMouseMove, false);
    this._canvas.addEventListener('click', this._handleMouseClick, false);
    this._canvas.addEventListener('dblclick', this._handleDoubleClick, false);

    // transform controls
    this._canvas.addEventListener('pointerdown', (e) => this._transform.pointerDown(e));
    this._canvas.addEventListener('pointermove', (e) => this._transform.pointerMove(e));
    this._canvas.addEventListener('pointerup', (e) => this._transform.pointerUp(e));
    this._canvas.addEventListener('pointerleave', () => this._transform.pointerHover(null));
    this._transform.addEventListener('dragging-changed', () => {
      this._orbit.enabled = !this._transform.dragging;
    });
    this._transform.addEventListener('objectChange', () => {
      for (const cb of this._transformListeners) cb();
    });

    this._isEventListenersAdded = true;
  }

  /** Обработчик события для hover */
  private _handleMouseMove = (e: MouseEvent) => {
    this._processRaycastEvent(e, EventTopics.SelectHover, true);
  };

  /** Обработчик события на click */
  private _handleMouseClick = (e: MouseEvent) => {
    this._processRaycastEvent(e, EventTopics.SelectClick, false);
  };

  /** Возвращает ближайшее пересечение по текущему положению курсора */
  private _getHitIntersection(e: MouseEvent): THREE.Intersection | null | undefined {
    // Если идет взаимодействие с камерой, то hover/click не отслеживается
    if (this._orbit.isInteracting || this._transform.dragging) return undefined;

    const rect = this._canvas.getBoundingClientRect();
    this._mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this._mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this._raycaster.setFromCamera(this._mouse, this.camera);

    // hit по текущему режиму
    const candidate = this._raycaster.intersectObjects(this.meshes, true)[0] ?? null;

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

    const surface = this._raycaster.intersectObjects(this.meshes, true)[0] ?? null;

    this._raycaster.layers.mask = prevMask;

    return this._getVisibleHit(candidate, surface);
  }

  private _handleDoubleClick = (e: MouseEvent) => {
    const hitIntersection = this._getHitIntersection(e);
    if (hitIntersection === undefined) return;

    // Снимаем selection только по dblclick в пустую сцену
    if (!hitIntersection) {
      this._bus.emit(EventTopics.SelectClick, null);
    }
  };

  // Hover сравнивается не только по object, но и по режимному ключу попадания.
  // Это нужно для Face/Edge/Vertex режимов, где разные элементы могут принадлежать одному и тому же Object3D.
  /** Вспомогательный метод для получения модели, которую выбрали и отправки события в event bus */
  private _processRaycastEvent(
    e: MouseEvent,
    topic: EventTopics.SelectHover | EventTopics.SelectClick,
    markHit: boolean,
  ) {
    const hitIntersection = this._getHitIntersection(e);
    if (hitIntersection === undefined) return;

    const hitObj: THREE.Object3D | null = hitIntersection?.object ?? null;

    // Hover
    if (markHit) {
      // Если курсор ушел с объекта, hover всегда сбрасываем
      if (!hitIntersection) {
        this.meshes.forEach((m) => (m.userData.isHit = false));
        this._lastHoverKey = null;
        this._bus.emit(topic, null);
        return;
      }

      const hoverKey = this._makeHoverKey(hitIntersection);

      // Если пересечение изменилось, отправляем новое hover-событие
      if (hoverKey !== this._lastHoverKey) {
        this.meshes.forEach((m) => (m.userData.isHit = false));
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
}
