// Core
import * as THREE from 'three';
import { Renderer } from './renderer';
// Extensions
import { OrbitWithState } from '../extensions/orbit-extension';
import { SymmetricAxesHelper } from '../extensions/symmetric-axes-helper';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
// IOC
import { inject, injectable } from 'tsyringe';
// Event bus
import { EventBus } from '../events/event-bus';
import { EventTopics } from '../events/event-topics';
// Types
import { type Figure, ToolType } from '@planara/types';

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
  private _transform!: TransformControls;
  private readonly _transformHelper!: THREE.Object3D;

  /** Raycast для получения событий наведения/клика по модели*/
  private _raycaster!: THREE.Raycaster;

  /** Курсор мыши */
  private readonly _mouse!: THREE.Vector2;

  /** Были ли инициализированы обработчики событий (hover/click) */
  private _isEventListenersAdded = false;

  /**
   * Последняя модель на которую наводились,
   * необходима для отправки только уникальных событий в event bus
   */
  private _lastHovered: THREE.Object3D | null = null;

  constructor(
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

    // Raycasting
    this._raycaster = new THREE.Raycaster();
    this._mouse = new THREE.Vector2();

    // Освещение
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.6));

    // Transform
    this._transform = new TransformControls(this.camera, this.renderer.domElement);
    this._transformHelper = this._transform.getHelper();
    this.scene.add(this._transformHelper);
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

    // внешние рёбра
    const edges = new THREE.EdgesGeometry(mesh.geometry);
    const line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0x888888, linewidth: 1 }),
    );
    mesh.add(line);

    if (!this._isEventListenersAdded) {
      this._initMouseListeners();
    }

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

  /** Инициализация обработчиков событий на hover/click */
  private _initMouseListeners() {
    // raycasting
    this.canvas.addEventListener('mousemove', this._handleMouseMove, false);
    this.canvas.addEventListener('click', this._handleMouseClick, false);

    // transform controls
    this.canvas.addEventListener('pointerdown', (e) => this._transform.pointerDown(e));
    this.canvas.addEventListener('pointermove', (e) => this._transform.pointerMove(e));
    this.canvas.addEventListener('pointerup', (e) => this._transform.pointerUp(e));
    this.canvas.addEventListener('pointerleave', () => this._transform.pointerHover(null));
    this._transform.addEventListener('dragging-changed', () => {
      this._orbit.enabled = !this._transform.dragging;
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

  /** Вспомогательный метод для получения модели, которую выбрали и отправки события в event bus */
  private _processRaycastEvent(
    e: MouseEvent,
    topic: EventTopics.SelectHover | EventTopics.SelectClick,
    markHit: boolean,
  ) {
    // Если идет взаимодействие с камерой, то hover/click не отслеживается
    if (this._orbit.isInteracting || this._transform.dragging) return;

    // Получение положения курсора мыши
    const rect = this._canvas.getBoundingClientRect();
    this._mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this._mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    // Проверка на пересечение модели и курсора мыши
    this._raycaster.setFromCamera(this._mouse, this.camera);
    const intersects = this._raycaster.intersectObjects(this.meshes, false);
    const hit = intersects[0]?.object ?? null;

    // Событие при наведении (hover), иначе click
    if (markHit) {
      // Если пересечение не совпадает с последней выбранной фигурой,
      // то отправляем новое событие в event bus
      if (hit !== this._lastHovered) {
        this.meshes.forEach((m) => (m.userData.isHit = false));
        if (hit) hit.userData.isHit = true;

        this._lastHovered = hit;

        // Отправка события
        this._bus.emit(topic, hit ? { mesh: hit } : null);
      }
    } else {
      // Отправка события
      this._bus.emit(topic, hit ? { mesh: hit } : null);
    }
  }
}
