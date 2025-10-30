// Core
import * as THREE from 'three';
// Types
import type { Figure } from '@planara/types';
// Interfaces
import type { Disposable } from 'tsyringe';

/**
 * Абстрактный базовый класс рендерера для работы с WebGL через OGL.
 * Отвечает за инициализацию сцены, камеры и цикла рендеринга.
 * @public
 */
export abstract class Renderer implements Disposable {
  /** Корневой объект сцены */
  protected scene!: THREE.Scene;

  /** Камера для сцены */
  protected camera!: THREE.PerspectiveCamera;

  /** Экземпляр рендерера Three.js */
  protected renderer!: THREE.WebGLRenderer;

  /** HTML-элемент canvas, на котором рендерится сцена */
  protected canvas!: HTMLCanvasElement;

  /** Массив моделей на сцене */
  protected meshes: THREE.Mesh[] = [];

  /**
   * Конструктор рендерера
   * @param canvas - HTMLCanvasElement для рендеринга
   */
  protected constructor(canvas: HTMLCanvasElement) {
    // Canvas из html верстки
    this.canvas = canvas;

    // Добавление сцены
    this.scene = new THREE.Scene();
    // Настройка фона
    this.scene.background = new THREE.Color(0x1a1a1a);

    // Добавление и настройка камеры
    this.camera = new THREE.PerspectiveCamera(
      45,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000,
    );
    this.camera.position.set(1, 1, 7);

    // Рендерер three.js
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    // Освещение
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // общий свет
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7);
    this.scene.add(directionalLight);
  }

  /**
   * Обновляет размер рендерера и камеры при изменении размеров canvas.
   */
  public resize() {
    this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
  }

  /**
   * Выполняет рендеринг сцены с текущей камерой.
   */
  protected render() {
    this.renderer.render(this.scene, this.camera);
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
    requestAnimationFrame(() => this.loop());
  }

  /**
   * Добавление фигуры на сцену.
   * @param figure - Данные фигуры: position, normal, uv
   */
  public addFigure(figure: Figure): THREE.Mesh {
    // Загрузка геометрии модели
    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(figure.position, 3));

    if (figure.normal) {
      geometry.setAttribute('normal', new THREE.Float32BufferAttribute(figure.normal, 3));
    }

    if (figure.uv) {
      geometry.setAttribute('uv', new THREE.Float32BufferAttribute(figure.uv, 2));
    }

    // Добавление базового материала
    const material = new THREE.MeshStandardMaterial({
      color: 0xbfbfbf,
      metalness: 0.0,
      roughness: 0.6,
    });

    // Создание объекта фигуры
    const mesh = new THREE.Mesh(geometry, material);

    // Добавление на сцену
    this.scene.add(mesh);
    // Сохранение в локальном массиве
    this.meshes.push(mesh);

    return mesh;
  }

  /**
   * Добавляет фигуру в сцену и сохраняет его во внутреннем массиве.
   *
   * @param mesh - Фигура для добавления в сцену.
   * @internal
   */
  public addMesh(mesh: THREE.Mesh) {
    if (!this.scene) return;

    this.scene.add(mesh);
    this.meshes.push(mesh);
  }

  /**
   * Убирает фигуру со сцены
   *
   * @param mesh - Фигура для удаления со сцены.
   * @internal
   */
  public removeMesh(mesh: THREE.Mesh) {
    if (!this.scene) return;

    this.scene.remove(mesh);
    this.meshes = this.meshes.filter((m) => m !== mesh);
  }

  /**
   * Возвращает список всех фигур, находящихся в сцене.
   *
   * @returns Массив текущих фигур.
   * @internal
   */
  public getMeshes(): THREE.Mesh[] {
    return this.meshes;
  }

  /**
   * Добавляет объект в сцену и (опционально) выставляет ему слой.
   *
   * @param obj - Объект, который нужно добавить в сцену.
   * @param layer - (Опц.) Номер слоя, который следует установить объекту перед добавлением.
   *
   * @remarks
   * Если рендерер уже диспоузнут (scene отсутствует), метод тихо завершится.
   * Слой задаётся через `obj.layers.set(layer)`, после чего объект добавляется в `this.scene`.
   *
   * @example
   * // Добавить оверлей на слой подсветок:
   * add(overlayLine, OVERLAY_LAYER);
   *
   * @internal
   */
  public addObject(obj: THREE.Object3D, layer?: number): void {
    if (!this.scene) return;

    if (typeof layer === 'number') {
      obj.layers.set(layer);
    }
    this.scene.add(obj);
  }

  /**
   * Удаляет объект из сцены (или из его родителя, если он есть).
   *
   * @param obj - Объект, который необходимо удалить.
   *
   * @remarks
   * Если у объекта есть `parent`, он будет удалён из родителя. Иначе — метод попытается
   * удалить его напрямую из `this.scene`. В рамках данного API метод не отвечает за
   * освобождение GPU-ресурсов; освобождайте геометрию/материалы отдельно при необходимости.
   *
   * @example
   * // Снять оверлей со сцены:
   * removeObject(overlayLine);
   *
   * @internal
   */
  public removeObject(obj: THREE.Object3D): void {
    if (!this.scene) return;

    // если есть родитель — убираем из него, иначе пробуем прямо из сцены
    if (obj.parent) {
      obj.parent.remove(obj);
    } else {
      this.scene.remove(obj);
    }
  }

  /**
   * Включает указанный слой у активной камеры.
   *
   * @param layer - Номер слоя, который требуется сделать видимым для камеры.
   *
   * @remarks
   * Полезно для показа служебных оверлеев (например, подсветки) на отдельном слое.
   * Метод не изменяет слои Raycaster — ими должен управлять другой слой API (например, IRaycastAPI).
   *
   * @example
   * // Убедиться, что камера видит слой оверлеев:
   * enableCameraLayer(OVERLAY_LAYER);
   *
   * @internal
   */
  public enableCameraLayer(layer: number): void {
    if (!this.camera) return;

    this.camera.layers.enable(layer);
  }

  /** Освобождает ресурсы рендерера, очищает внутренние данные. */
  public dispose(): Promise<void> | void {
    if (this.meshes) {
      this.meshes.length = 0;
      this.meshes = [];
    }

    this.scene = null!;
    this.camera = null!;

    this.renderer?.dispose();

    this.canvas = null!;
  }
}
