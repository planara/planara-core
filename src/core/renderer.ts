import { Renderer as OGLRenderer, Camera, Transform, Mesh, Geometry, type Program } from 'ogl';
import { createProgram } from '../utils/program-settings';
import type { Figure } from '@planara/types';

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

  protected program: Program;

  /**
   * Конструктор рендерера
   * @param canvas - HTMLCanvasElement для рендеринга
   */
  protected constructor(canvas: HTMLCanvasElement) {
    // Canvas из html верстки
    this.canvas = canvas;

    // Рендерер ogl
    this.gl = new OGLRenderer({ canvas });

    // Настройка рендерера под размеры canvas
    this.gl.setSize(canvas.clientWidth, canvas.clientHeight);

    // Настройка фона
    this.gl.gl.clearColor(1, 1, 1, 1);

    // Добавление сцены
    this.scene = new Transform();

    // Добавление и настройка камеры
    this.camera = new Camera(this.gl.gl, { fov: 45 });
    this.camera.position.set(1, 1, 7);
    this.camera.lookAt([0, 0, 0]);

    // Добавление Program для настройки рендеринга
    this.program = createProgram(this.gl.gl);
  }

  /**
   * Обновляет размер рендерера и камеры при изменении размеров canvas.
   */
  public resize() {
    // Синхронизация размеров canvas с рендерером и камерой
    this.gl.setSize(this.canvas.width, this.canvas.height);
    this.camera.perspective({ aspect: this.canvas.width / this.canvas.height });
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

  /**
   * Публичный метод для добавления фигуры.
   * @param figure Данные фигуры: position, normal, uv
   */
  public addFigure(figure: Figure) {
    // Загрузка геометрии модели
    const geometry = new Geometry(this.gl.gl, {
      position: { size: 3, data: new Float32Array(figure.position) },
      normal: { size: 3, data: new Float32Array(figure.normal ?? []) },
      uv: { size: 2, data: new Float32Array(figure.uv ?? []) },
    });

    // Создание модели с настройками для рендеринга
    const mesh = new Mesh(this.gl.gl, {
      geometry,
      program: this.program,
    });

    // Добавление модели на сцену
    mesh.setParent(this.scene);
    return mesh;
  }
}
