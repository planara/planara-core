// Core
import * as THREE from 'three';

/**
 * API для управления мешами (фигурами) в сцене.
 *
 * @remarks
 * Предоставляет базовые CRUD-операции для работы с мешами:
 * - добавление одного или нескольких мешей
 * - удаление одного или нескольких мешей
 * - получение списка всех мешей
 *
 * Используется модулями и менеджерами, которым нужно управлять
 * 3D-объектами на сцене (например, `SceneModule`).
 *
 * @see {@link SceneModule} - реализация этого интерфейса
 * @see {@link Renderer} - рендерер, предоставляющий доступ к сцене
 *
 * @internal
 * @interface
 */
export interface IMeshApi {
  /**
   * Добавляет один меш на сцену.
   *
   * @param mesh - меш для добавления
   *
   * @remarks
   * Меш становится видимым на сцене после вызова этого метода.
   * Если меш уже добавлен, он не будет продублирован.
   *
   * @example
   * ```typescript
   * const geometry = new THREE.BoxGeometry(1, 1, 1);
   * const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
   * const mesh = new THREE.Mesh(geometry, material);
   * meshApi.addMesh(mesh);
   * ```
   *
   * @internal
   * @method
   */
  addMesh(mesh: THREE.Mesh): void;

  /**
   * Добавляет несколько мешей на сцену за один вызов.
   *
   * @param meshes - массив мешей для добавления
   *
   * @remarks
   * Полезно для массового добавления объектов, например,
   * при загрузке сцены из файла.
   *
   * @example
   * ```typescript
   * const meshes = [mesh1, mesh2, mesh3];
   * meshApi.addMeshes(meshes);
   * ```
   *
   * @internal
   * @method
   */
  addMeshes(meshes: THREE.Mesh[]): void;

  /**
   * Удаляет один меш со сцены.
   *
   * @param mesh - меш для удаления
   *
   * @remarks
   * Меш перестаёт отображаться, но его геометрия и материал
   * остаются в памяти. Для полного освобождения памяти нужно
   * вызвать `dispose()` у геометрии и материала.
   *
   * @example
   * ```typescript
   * meshApi.removeMesh(mesh);
   * mesh.geometry.dispose();
   * mesh.material.dispose();
   * ```
   *
   * @internal
   * @method
   */
  removeMesh(mesh: THREE.Mesh): void;

  /**
   * Удаляет несколько мешей со сцены за один вызов.
   *
   * @param meshes - массив мешей для удаления
   *
   * @remarks
   * Полезно для массового удаления объектов, например,
   * при очистке сцены.
   *
   * @example
   * ```typescript
   * const meshes = meshApi.getMeshes();
   * meshApi.removeMeshes(meshes);
   * ```
   *
   * @internal
   * @method
   */
  removeMeshes(meshes: THREE.Mesh[]): void;

  /**
   * Возвращает список всех мешей, находящихся на сцене.
   *
   * @returns массив мешей
   *
   * @remarks
   * Возвращает только меши, добавленные через `addMesh` или `addMeshes`.
   * Вспомогательные объекты (сетка, оси, свет) не включаются в список.
   *
   * @example
   * ```typescript
   * const allMeshes = meshApi.getMeshes();
   * ```
   *
   * @internal
   * @method
   */
  getMeshes(): THREE.Mesh[];
}
