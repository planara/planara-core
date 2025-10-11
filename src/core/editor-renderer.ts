// Core
import { Renderer } from './renderer';
import { GridHelper, AxesHelper, Vec2, Raycast, type MeshRenderCallback, type Mesh } from 'ogl';
// Types
import type { Figure } from '@planara/types';
// Extensions
import { OrbitWithState } from '../extensions/orbit-extension';
import type { EditorMesh } from '../extensions/mesh-extension';
// IOC
import { inject, injectable } from 'tsyringe';
// Event bus
import { EventBus } from '../events/event-bus';
import { EventTopics } from '../events/event-topics';

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

  /** Raycast для подсветки моделей при наведении */
  private _raycast!: Raycast;

  /** Курсор мыши для остлеживания наведения на 3D-модель */
  private _mouse!: Vec2;

  /** Были ли зарегистрированы обработчики событий для мыши */
  private _isEventListenersAdded!: boolean;

  /**
   * Инициализация сцены редактора.
   * Создает сетку, оси координат и orbit-контроллер.
   */
  public constructor(
    @inject('Canvas') private _canvas: HTMLCanvasElement,
    @inject('EventBus') private _bus: EventBus,
  ) {
    super(_canvas);

    // сетка
    const grid = new GridHelper(this.gl.gl, { size: 10, divisions: 10 });
    grid.position.y = -0.001;
    grid.setParent(this.scene);

    // оси
    const axes = new AxesHelper(this.gl.gl, { size: 6, symmetric: true });
    axes.setParent(this.scene);

    // orbit
    this._orbit = new OrbitWithState(this.camera, { element: this.canvas });

    // raycast
    this._raycast = new Raycast();

    // курсор мыши
    this._mouse = new Vec2();

    // Изначально обработчики мыши не зарегистрированы
    this._isEventListenersAdded = false;
  }

  /**
   * Обновление состояния рендерера.
   */
  protected update() {
    // Защита от вызова до инициализации
    this._orbit?.update();
  }

  /**
   * Метод для добавления фигуры.
   * Настройка raycast.
   * @param figure - Данные фигуры: position, normal, uv
   */
  public override addFigure(figure: Figure) {
    const mesh = super.addFigure(figure);

    // Настройка параметров для raycast
    if (mesh.geometry) {
      // получение типа фигуры
      const name = mesh.geometry.constructor.name;
      // если фигура похожа на сферу — используем сферическое пересечение
      mesh.geometry.raycast = name.includes('Sphere') ? 'sphere' : 'box';
    }

    // регистрация обработчиков мыши
    if (!this._isEventListenersAdded) {
      this.initMouseListeners();
    }

    return mesh;
  }

  /**
   * Устанавливает callback, который будет вызываться перед рендером конкретного меша.
   *
   * @param mesh - Меш, для которого нужно задать callback.
   * @param f - Функция обратного вызова, выполняемая перед рендером меша.
   * @internal
   */
  public setMeshBeforeRender(mesh: Mesh, f: MeshRenderCallback) {
    mesh.onBeforeRender(f);
  }

  /**
   * Инициализация обработчиков мыши для raycast
   */
  private initMouseListeners() {
    document.addEventListener('mousemove', this._handleMouseMove, false);
    document.addEventListener('click', this._handleMouseClick, false);
    this._isEventListenersAdded = true;
  }

  /**
   * Обработчик движения мыши
   */
  private _handleMouseMove = (e: MouseEvent) => {
    this._processRaycastEvent(e, EventTopics.SelectHover, true);
  };

  /**
   * Обработчик клика мыши
   */
  private _handleMouseClick = (e: MouseEvent) => {
    this._processRaycastEvent(e, EventTopics.SelectClick, false);
  };

  /**
   * Универсальная логика raycast-события
   */
  private _processRaycastEvent(
    e: MouseEvent,
    topic: EventTopics.SelectHover | EventTopics.SelectClick,
    markHit: boolean
  ) {
    // Если orbit вращает камеру — не обрабатываем
    if (this._orbit.isInteracting) return;

    // нормализованные координаты [-1, 1]
    this._mouse.set(
      2.0 * (e.x / this.gl.width) - 1.0,
      2.0 * (1.0 - e.y / this.gl.height) - 1.0
    );

    // обновление луча
    this._raycast.castMouse(this.camera, this._mouse);

    // сброс isHit для всех фигур (только при hover)
    if (markHit) {
      this.meshes.forEach((mesh) => ((mesh as EditorMesh).isHit = false));
    }

    // пересечение с мешами
    const hits = this._raycast.intersectBounds(this.meshes);
    const mesh = hits.length ? hits[0] : null;

    // отправляем событие через EventBus
    this._bus.emit(topic, mesh ? { mesh } : null);

    // отмечаем hit (только при hover)
    if (markHit) {
      hits.forEach((mesh) => ((mesh as EditorMesh).isHit = true));
    }
  }

  /** Деструктор */
  public destroy() {
    // Очистка обработчиков событий, если были добавлены
    if (this._isEventListenersAdded) {
      document.removeEventListener('mousemove', this._handleMouseMove, false);
      document.removeEventListener('click', this._handleMouseClick, false);
      this._isEventListenersAdded = false;
    }

    this._orbit.destroy();
    this._orbit = null!;
    this._raycast = null!;
    this._mouse = null!;

    super.destroy();
  }
}
