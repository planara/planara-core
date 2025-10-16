// Core
import * as THREE from 'three';
// Types
import type { Figure } from '@planara/types';

/**
 * Абстрактный базовый класс рендерера для работы с WebGL через OGL.
 * Отвечает за инициализацию сцены, камеры и цикла рендеринга.
 * @public
 */
export abstract class Renderer {
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
   * Публичный метод для добавления фигуры.
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

  /** Деструктор */
  public destroy() {
    if (this.meshes) {
      this.meshes.length = 0;
      this.meshes = [];
    }

    this.scene = null!;
    this.camera = null!;

    this.renderer = null!;

    this.canvas = null!;
  }
}
