import { Renderer as OGLRenderer, Camera, Transform } from 'ogl';

/**
 * Абстрактный базовый класс рендерера для работы с WebGL через OGL.
 * Отвечает за инициализацию сцены, камеры и цикла рендеринга.
 */
export abstract class Renderer {
  /** Экземпляр рендерера OGL */
  public gl: OGLRenderer;

  /** Корневой объект сцены */
  public scene: Transform;

  /** Камера для сцены */
  public camera: Camera;

  /** HTML-элемент canvas, на котором рендерится сцена */
  protected canvas: HTMLCanvasElement;

  /**
   * Конструктор рендерера
   * @param canvas - HTMLCanvasElement для рендеринга
   */
  constructor(canvas: HTMLCanvasElement) {
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
  resize() {
    this.gl.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.camera.perspective({ aspect: this.canvas.width / this.canvas.height });
  }

  /**
   * Выполняет рендеринг сцены с текущей камерой.
   */
  render() {
    this.gl.render({ scene: this.scene, camera: this.camera });
  }

  /**
   * Запускает основной цикл рендеринга.
   */
  loop() {
    this.update();
    this.render();
    requestAnimationFrame(this.loop.bind(this));
  }

  /**
   * Метод для обновления логики рендерера.
   */
  protected update(): void {}
}
