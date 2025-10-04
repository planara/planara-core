import { Renderer } from './renderer';
import { Orbit, Vec3 } from 'ogl';

/**
 * Рендерер для предпросмотра 3D-модели.
 * Настраивает сцену, камеру и орбитальную навигацию (по горизонтали).
 * Наследуется от базового Renderer.
 */
export class PreviewRenderer extends Renderer {
  /** Orbit-контроллер для управления камерой */
  private orbit!: Orbit;

  /**
   * Инициализация сцены предпросмотра.
   * @param canvas - HTMLCanvasElement для рендеринга
   */
  constructor(canvas: HTMLCanvasElement) {
    super(canvas);

    // Ограничение вращения камеры по горизонтали
    this.orbit = new Orbit(this.camera, {
      element: this.canvas,
      target: new Vec3(0, 0, 0),
      minPolarAngle: Math.PI / 2,
      maxPolarAngle: Math.PI / 2,
      enableRotate: true,
      enableZoom: false,
      enablePan: false,
    });
  }

  /**
   * Обновление состояния рендерера.
   */
  protected update() {
    // Защита от вызова до инициализации
    this.orbit?.update();
  }
}
