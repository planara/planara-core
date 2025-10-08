// Core
import { Renderer } from './renderer';
import { GridHelper, AxesHelper, Vec2, type Mesh, Raycast, type OGLRenderingContext } from 'ogl';
// Types
import type { Figure } from '@planara/types';
// Extensions
import { OrbitWithState } from '../extensions/orbit-extension';
// IOC
import { injectable } from 'tsyringe';

/**
 * Рендерер для редактора.
 * Добавляет сетку, оси координат и поддержку Orbit для управления камерой.
 * Наследуется от базового Renderer.
 * @public
 */
@injectable()
export class EditorRenderer extends Renderer {
  /** Orbit-контроллер для управления камерой */
  private orbit!: OrbitWithState;

  /** Raycast для подсветки моделей при наведении */
  private raycast!: Raycast;

  /** Курсор мыши для остлеживания наведения на 3D-модель */
  private mouse!: Vec2;

  /** Были ли зарегистрированы обработчики событий для мыши */
  private isEventListenersAdded!: boolean;

  /**
   * Инициализация сцены редактора.
   * Создает сетку, оси координат и orbit-контроллер.
   * @param canvas - HTMLCanvasElement для рендеринга
   */
  public constructor(canvas: HTMLCanvasElement) {
    super(canvas);

    // сетка
    const grid = new GridHelper(this.gl.gl, { size: 10, divisions: 10 });
    grid.position.y = -0.001;
    grid.setParent(this.scene);

    // оси
    const axes = new AxesHelper(this.gl.gl, { size: 6, symmetric: true });
    axes.setParent(this.scene);

    // orbit
    this.orbit = new OrbitWithState(this.camera, { element: this.canvas });

    // raycast
    this.raycast = new Raycast();

    // курсор мыши
    this.mouse = new Vec2();

    // Изначально обработчики мыши не зарегистрированы
    this.isEventListenersAdded = false;
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
   * Обновление состояния рендерера.
   */
  protected update() {
    // Защита от вызова до инициализации
    this.orbit?.update();
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

    // создание поля isHit
    (mesh as any).isHit = false;

    // регистрация функции обновления uniform перед рендером
    mesh.onBeforeRender(({ mesh }) => {
      this.updateHitUniform(mesh);
    });

    // регистрация обработчиков мыши
    if (!this.isEventListenersAdded) {
      this.initMouseListeners();
    }

    return mesh;
  }

  /**
   * Обновление uniform uHit для конкретной 3D-модели
   */
  protected updateHitUniform(mesh: Mesh) {
    this.program.uniforms.uHit.value = (mesh as any).isHit ? 1 : 0;
  }

  /**
   * Инициализация обработчиков мыши для raycast
   */
  private initMouseListeners() {
    document.addEventListener('mousemove', this.handleMouseMove, false);
    this.isEventListenersAdded = true;
  }

  /**
   * Обработчик движения мыши
   */
  private handleMouseMove = (e: MouseEvent) => {
    // Если используется камера, то raycast выключен
    if (this.orbit.isInteracting) return;

    // нормализованные координаты [-1, 1]
    this.mouse.set(2.0 * (e.x / this.gl.width) - 1.0, 2.0 * (1.0 - e.y / this.gl.height) - 1.0);

    // обновление луча
    this.raycast.castMouse(this.camera, this.mouse);

    // сброс isHit для всех фигур
    this.meshes.forEach((mesh) => ((mesh as any).isHit = false));

    // получение фигур, на которые навелись
    const hits = this.raycast.intersectBounds(this.meshes);

    // отмечаем их как hit
    hits.forEach((mesh) => ((mesh as any).isHit = true));
  };

  /** Деструктор */
  public destroy() {
    // Очистка обработчиков событий, если были добавлены
    if (this.isEventListenersAdded) {
      window.removeEventListener('mousemove', this.handleMouseMove, false);
      this.isEventListenersAdded = false;
    }

    this.orbit = null!;
    this.raycast = null!;
    this.mouse = null!;

    super.destroy();
  }
}
