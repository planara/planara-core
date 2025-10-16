// Core
import { Renderer } from './renderer';
// Extensions
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * Рендерер для предпросмотра 3D-модели.
 * Настраивает сцену, камеру и орбитальную навигацию по горизонтали.
 * @alpha
 */
export class PreviewRenderer extends Renderer {
  /** Orbit-контроллер для управления камерой */
  private _orbit!: OrbitControls;

  constructor(canvas: HTMLCanvasElement) {
    super(canvas);

    // Камера
    this.camera.position.set(1, 1, 7);
    this.camera.lookAt(0, 0, 0);

    // OrbitControls с ограничением вращения по вертикали
    this._orbit = new OrbitControls(this.camera, this.canvas);
    this._orbit.target.set(0, 0, 0);
    this._orbit.minPolarAngle = Math.PI / 2;
    this._orbit.maxPolarAngle = Math.PI / 2;
    this._orbit.enableRotate = true;
    this._orbit.enableZoom = false;
    this._orbit.enablePan = false;
  }

  /**
   * Обновление состояния рендерера.
   */
  protected update() {
    // Обновляем orbit controls
    this._orbit?.update();
  }
}
