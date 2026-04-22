// Core
import * as THREE from 'three';
// IOC
import { type Disposable, inject, injectable } from 'tsyringe';
// Interfaces
import type { IRendererCameraAccess } from '../interfaces/api/renderer/renderer-camera-access';
import type { IRendererAccess } from '../interfaces/api/renderer/renderer-access';
import type { IRendererDomAccess } from '../interfaces/api/renderer/renderer-dom-access';
import type { IRendererSceneAccess } from '../interfaces/api/renderer/renderer-scene-access';
import type { IRenderable } from '../interfaces/api/renderer/renderable';

/**
 * Базовый класс рендерера для работы с WebGL через Three.js.
 *
 * @remarks
 * Отвечает за инициализацию сцены, камеры, освещения и цикла рендеринга.
 * Предоставляет низкоуровневый API для доступа к основным компонентам Three.js.
 *
 * **Не содержит логики управления камерой или выделения объектов** —
 * это ответственность модулей (например, `ControlsModule`, `RaycasterModule`).
 *
 * Рендерер реализует интерфейсы нижнего API:
 * - `IRendererAccess` — доступ к WebGLRenderer
 * - `IRendererCameraAccess` — доступ к камере
 * - `IRendererDomAccess` — доступ к DOM-элементам
 * - `IRendererSceneAccess` — доступ к сцене
 *
 * @see {@link IRendererAccess} - доступ к WebGLRenderer
 * @see {@link IRendererCameraAccess} - доступ к камере
 * @see {@link IRendererDomAccess} - доступ к DOM
 * @see {@link IRendererSceneAccess} - доступ к сцене
 *
 * @public
 * @class
 */
@injectable()
export class Renderer
  implements
    IRendererAccess,
    IRendererCameraAccess,
    IRendererDomAccess,
    IRendererSceneAccess,
    IRenderable,
    Disposable
{
  /**
   * Корневой объект сцены Three.js.
   *
   * @protected
   * @member
   */
  protected scene!: THREE.Scene;

  /**
   * Камера для сцены Three.js.
   *
   * @protected
   * @member
   */
  protected camera!: THREE.PerspectiveCamera;

  /**
   * Экземпляр Three.js WebGLRenderer.
   *
   * @protected
   * @member
   */
  protected renderer!: THREE.WebGLRenderer;

  /**
   * HTML-элемент canvas, на котором рендерится сцена.
   *
   * @protected
   * @member
   */
  protected canvas!: HTMLCanvasElement;

  /**
   * Конструктор рендерера.
   *
   * @param _canvas - HTMLCanvasElement для рендеринга
   *
   * @remarks
   * Инициализирует сцену с тёмным фоном, перспективную камеру
   * (45° FOV, near 0.1, far 1000) и базовое освещение:
   * - `AmbientLight` (0xffffff, 0.5) — общий свет
   * - `DirectionalLight` (0xffffff, 1) — направленный свет
   *
   * @example
   * ```typescript
   * const renderer = new Renderer(canvas);
   * ```
   *
   * @public
   * @constructor
   */
  public constructor(@inject('Canvas') _canvas: HTMLCanvasElement) {
    // Canvas из html верстки
    this.canvas = _canvas;

    // Добавление сцены
    this.scene = new THREE.Scene();
    // Настройка фона
    this.scene.background = new THREE.Color(0x1a1a1a);

    // Добавление и настройка камеры
    this.camera = new THREE.PerspectiveCamera(
      45,
      this.canvas.clientWidth / this.canvas.clientHeight,
      0.1,
      1000,
    );
    this.camera.position.set(1, 1, 7);

    // Рендерер three.js
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);

    // Освещение
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // общий свет
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7);
    this.scene.add(directionalLight);
  }

  /**
   * Обновляет размер рендерера и пропорции камеры.
   *
   * @remarks
   * Вызывается при изменении размеров canvas (например, при ресайзе окна браузера).
   *
   * @example
   * ```typescript
   * window.addEventListener('resize', () => renderer.resize());
   * ```
   *
   * @oublic
   * @method
   */
  public resize() {
    this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
  }

  /**
   * Выполняет рендеринг текущего кадра.
   *
   * @remarks
   * Рендерит сцену с текущей камерой.
   * Вызывается автоматически в цикле `loop()`.
   *
   * @public
   * @method
   */
  public render() {
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Обновляет состояние рендерера перед рендерингом.
   *
   * @remarks
   * Пустой метод, предназначен для переопределения в наследниках
   * (например, для обновления контролов камеры).
   *
   * @protected
   * @method
   * @virtual
   */
  protected update(): void {}

  /**
   * Запускает основной цикл рендеринга.
   *
   * @remarks
   * Вызывает `update()` и `render()` каждый кадр с помощью `requestAnimationFrame`.
   * **Важно:** вызывать метод только один раз.
   *
   * @example
   * ```typescript
   * renderer.loop();
   * ```
   *
   * @public
   * @method
   */
  public loop() {
    this.update();
    this.render();
    requestAnimationFrame(() => this.loop());
  }

  public getCamera(): THREE.Camera {
    return this.camera;
  }

  public getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  public getDomElement(): HTMLElement {
    return this.renderer.domElement;
  }

  public getScene(): THREE.Scene {
    return this.scene;
  }

  /**
   * Освобождает ресурсы рендерера.
   *
   * @remarks
   * Удаляет ссылки на сцену, камеру и canvas, вызывает `dispose()` у WebGLRenderer.
   * Вызывается при уничтожении редактора IOC-контейнером.
   *
   * @public
   * @method
   */
  public dispose(): Promise<void> | void {
    this.scene = null!;
    this.camera = null!;

    this.renderer?.dispose();

    this.canvas = null!;
  }
}
