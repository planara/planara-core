import { Renderer } from './renderer';
import { GridHelper, Orbit, AxesHelper, Raycast, Vec2, type Mesh } from 'ogl';
import type { Figure } from '@planara/types';

/**
 * Рендерер для редактора.
 * Добавляет сетку, оси координат и поддержку Orbit для управления камерой.
 * Наследуется от базового Renderer.
 */
export class EditorRenderer extends Renderer {
  /** Orbit-контроллер для управления камерой */
  private orbit!: Orbit;

  /** Raycast для подсветки моделей при наведении */
  private raycast!: Raycast;

  /** Курсор мыши для остлеживания наведения на 3D-модель */
  private readonly mouse!: Vec2;

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
    this.orbit = new Orbit(this.camera, { element: this.canvas });

    // raycast
    this.raycast = new Raycast();

    // курсор мыши
    this.mouse = new Vec2();

    // регистрация обработчиков мыши
    this.initMouseListeners();
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
   * @param figure Данные фигуры: position, normal, uv
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
    window.addEventListener('load', () => {
      document.addEventListener('mousemove', this.handleMouseMove, false);
      document.addEventListener('touchmove', this.handleMouseMove, false);
    });
  }

  /**
   * Обработчик движения мыши
   */
  private handleMouseMove = (e: MouseEvent | TouchEvent) => {
    let x: number, y: number;
    if (e instanceof MouseEvent) {
      x = e.clientX;
      y = e.clientY;
    } else {
      // Проверка на пустоту у тач-устройств
      if (e.touches[0] === undefined) return;

      x = e.touches[0].clientX;
      y = e.touches[0].clientY;
    }

    // нормализованные координаты [-1, 1]
    this.mouse.set(2.0 * (x / this.canvas.width) - 1.0, 2.0 * (1.0 - y / this.canvas.height) - 1.0);

    // обновление луча
    this.raycast.castMouse(this.camera, this.mouse);

    // сброс isHit для всех фигур
    (this.meshes as (Mesh & { isHit?: boolean })[]).forEach((mesh) => (mesh.isHit = false));

    // получение фигур, на которые навелись
    const hits = this.raycast.intersectBounds(this.meshes);

    // отмечаем их как hit
    hits.forEach((mesh) => ((mesh as any).isHit = true));
  };
}
