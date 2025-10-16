// Core
import { Renderer } from './renderer';
import * as THREE from 'three';
// Helpers
import { OrbitWithState } from '../extensions/orbit-extension';
import { SymmetricAxesHelper } from '../helpers/symmetric-axes-helper';
// IOC
import { inject, injectable } from 'tsyringe';
// Event bus
import { EventBus } from '../events/event-bus';
import { EventTopics } from '../events/event-topics';
import type { Figure } from '@planara/types';

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
  private _raycaster!: THREE.Raycaster;
  private readonly _mouse!: THREE.Vector2;
  private _isEventListenersAdded = false;
  private _lastHovered: THREE.Object3D | null = null;

  constructor(
    @inject('Canvas') private _canvas: HTMLCanvasElement,
    @inject('EventBus') private _bus: EventBus,
  ) {
    super(_canvas);
    console.log('renderer');
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
  }

  /**
   * Обновление состояния рендерера.
   */
  protected update() {
    this._orbit.update();
  }

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
      this.initMouseListeners();
    }

    return mesh;
  }

  private initMouseListeners() {
    document.addEventListener('mousemove', this._handleMouseMove, false);
    document.addEventListener('click', this._handleMouseClick, false);
    this._isEventListenersAdded = true;
  }

  private _handleMouseMove = (e: MouseEvent) => {
    this._processRaycastEvent(e, EventTopics.SelectHover, true);
  };

  private _handleMouseClick = (e: MouseEvent) => {
    this._processRaycastEvent(e, EventTopics.SelectClick, false);
  };

  private _processRaycastEvent(
    e: MouseEvent,
    topic: EventTopics.SelectHover | EventTopics.SelectClick,
    markHit: boolean,
  ) {
    if (this._orbit.isInteracting) return;

    const rect = this._canvas.getBoundingClientRect();
    this._mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this._mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this._raycaster.setFromCamera(this._mouse, this.camera);
    const intersects = this._raycaster.intersectObjects(this.meshes, false);
    const hit = intersects[0]?.object ?? null;

    if (markHit) {
      // Hover: шлём событие только при смене объекта
      if (hit !== this._lastHovered) {
        this.meshes.forEach((m) => (m.userData.isHit = false));
        if (hit) hit.userData.isHit = true;

        this._lastHovered = hit;

        this._bus.emit(topic, hit ? { mesh: hit } : null);
        console.log('[hover]:', hit ? 'hit' : 'cleared', hit?.name);
      }
    } else {
      // Click: шлём событие всегда
      this._bus.emit(topic, hit ? { mesh: hit } : null);
      console.log('[click]:', hit ? 'hit' : 'cleared', hit?.name);

      // Не трогаем _lastHovered здесь
    }
  }
}
