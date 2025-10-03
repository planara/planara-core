import { Renderer } from './renderer';
import { GridHelper, Orbit, AxesHelper } from 'ogl';

/**
 * Рендерер для редактора.
 * Добавляет сетку, оси координат и поддержку Orbit для управления камерой.
 * Наследуется от базового Renderer.
 */
export class EditorRenderer extends Renderer {
  /** Orbit-контроллер для управления камерой */
  private orbit!: Orbit;

  /**
   * Инициализация сцены редактора.
   * Создает сетку, оси координат и orbit-контроллер.
   */
  protected init() {
    // сетка
    const grid = new GridHelper(this.gl.gl, { size: 10, divisions: 10 });
    grid.position.y = -0.001;
    grid.setParent(this.scene);

    // оси
    const axes = new AxesHelper(this.gl.gl, { size: 6, symmetric: true });
    axes.setParent(this.scene);

    // orbit
    this.orbit = new Orbit(this.camera);
  }

  /**
   * Обновление состояния рендерера.
   */
  protected update() {
    this.orbit.update();
  }
}
