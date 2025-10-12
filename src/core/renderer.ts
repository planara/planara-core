// Core
import {
  Renderer as OGLRenderer,
  Camera,
  Transform,
  Geometry,
  type Program,
  type OGLRenderingContext,
  type Mesh,
} from 'ogl';
// Utils
import { _createProgram } from '../utils/program-settings';
// Types
import type { Figure } from '@planara/types';
import { EditorMesh } from '../extensions/mesh-extension';

/**
 * Абстрактный базовый класс рендерера для работы с WebGL через OGL.
 * Отвечает за инициализацию сцены, камеры и цикла рендеринга.
 * @public
 */
export abstract class Renderer {
  /** Экземпляр рендерера OGL */
  protected gl!: OGLRenderer;

  /** Корневой объект сцены */
  protected scene!: Transform;

  /** Камера для сцены */
  protected camera!: Camera;

  /** HTML-элемент canvas, на котором рендерится сцена */
  protected canvas!: HTMLCanvasElement;

  /** Program для настройки рендеринга моделей */
  protected program!: Program;

  /** Массив моделей на сцене */
  protected meshes!: Mesh[];

  /**
   * Конструктор рендерера
   * @param canvas - HTMLCanvasElement для рендеринга
   */
  protected constructor(canvas: HTMLCanvasElement) {
    // Canvas из html верстки
    this.canvas = canvas;

    // Рендерер ogl
    this.gl = new OGLRenderer({ canvas, dpr: 2 });

    // Настройка рендерера под размеры canvas
    this.gl.setSize(canvas.clientWidth, canvas.clientHeight);

    // Настройка фона
    this.gl.gl.clearColor(0.1, 0.1, 0.1, 1.0);

    // Добавление сцены
    this.scene = new Transform();

    // Добавление и настройка камеры
    this.camera = new Camera(this.gl.gl, { fov: 45 });
    this.camera.position.set(1, 1, 7);
    this.camera.lookAt([0, 0, 0]);

    // Добавление Program для настройки рендеринга
    this.program = _createProgram(this.gl.gl);

    // Инициализация массива фигур на сцене
    this.meshes = [];
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
   * @param figure - Данные фигуры: position, normal, uv
   */
  public addFigure(figure: Figure) {
    // Загрузка геометрии модели
    const geometry = new Geometry(this.gl.gl, {
      position: { size: 3, data: new Float32Array(figure.position) },
      normal: { size: 3, data: new Float32Array(figure.normal ?? []) },
      uv: { size: 2, data: new Float32Array(figure.uv ?? []) },
    });

    // Создание модели с настройками для рендеринга
    const mesh = new EditorMesh(this.gl.gl, {
      geometry,
      program: this.program,
    });

    // Добавление модели на сцену
    mesh.setParent(this.scene);

    // Добавление фигуры в массив моделей на сцене
    this.meshes.push(mesh);
    return mesh;
  }

  /**
   * Добавляет фигуру в сцену и сохраняет его во внутреннем массиве.
   *
   * @param mesh - Фигура для добавления в сцену.
   * @internal
   */
  public addMesh(mesh: Mesh): void {
    this.scene.addChild(mesh);
  }

  /**
   * Возвращает WebGL контекст рендерера.
   *
   * @returns Контекст WebGL (OGLRenderingContext) текущей сцены.
   * @internal
   */
  public getContext(): OGLRenderingContext {
    return this.gl.gl;
  }

  /**
   * Убирает фигуру со сцены
   *
   * @param mesh - Фигура для удаления со сцены.
   * @internal
   */
  public removeMesh(mesh: Mesh): void {
    this.scene.removeChild(mesh);
  }

  /**
   * Возвращает список всех фигур, находящихся в сцене.
   *
   * @returns Массив текущих фигур.
   * @internal
   */
  public getMeshes(): Mesh[] {
    return this.meshes;
  }

  /**
   * Возвращает настройку для рендеринга.
   *
   * @returns Program для настройки рендеринга моделей.
   * @internal
   */
  public getProgram(): Program {
    return this.program;
  }

  /** Деструктор */
  public destroy() {
    if (this.meshes) {
      this.meshes.length = 0;
      this.meshes = [];
    }

    this.scene = null!;
    this.camera = null!;

    this.program = null!;

    this.gl = null!;

    this.canvas = null!;
  }
}
