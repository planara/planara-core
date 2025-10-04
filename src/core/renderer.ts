import { Renderer as OGLRenderer, Camera, Transform } from 'ogl';

/**
 * Абстрактный базовый класс рендерера для работы с WebGL через OGL.
 * Отвечает за инициализацию сцены, камеры и цикла рендеринга.
 */
export abstract class Renderer {
  /** Экземпляр рендерера OGL */
  protected gl: OGLRenderer;

  /** Корневой объект сцены */
  protected scene: Transform;

  /** Камера для сцены */
  protected camera: Camera;

  /** HTML-элемент canvas, на котором рендерится сцена */
  protected canvas: HTMLCanvasElement;

  /**
   * Конструктор рендерера
   * @param canvas - HTMLCanvasElement для рендеринга
   */
  protected constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.gl = new OGLRenderer({ canvas });
    this.gl.setSize(canvas.clientWidth, canvas.clientHeight);
    this.gl.gl.clearColor(1, 1, 1, 1);

    this.scene = new Transform();

    this.camera = new Camera(this.gl.gl, { fov: 45 });
    this.camera.position.set(1, 1, 7);
    this.camera.lookAt([0, 0, 0]);
  }

  /**
   * Обновляет размер рендерера и камеры при изменении размеров canvas.
   */
  public resize() {
    // Установка размеров для canvas
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;

    // Синхронизация размеров canvas с рендерером и камерой
    this.gl.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.camera.perspective({ aspect: this.canvas.clientWidth / this.canvas.clientHeight });
  }

  /**
   * Выполняет рендеринг сцены с текущей камерой.
   */
  protected render() {
    this.gl.render({ scene: this.scene, camera: this.camera });
  }

  /**
   * Метод для обновления логики рендерера.
   */
  protected update(): void {}

  /**
   * Запускает основной цикл рендеринга.
   */
  public loop() {
    this.update();
    this.render();
    requestAnimationFrame(this.loop.bind(this));
  }
}
