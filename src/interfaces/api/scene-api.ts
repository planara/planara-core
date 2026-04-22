// Core
import * as THREE from 'three';

/**
 * Высокоуровневое API для управления сценой.
 *
 * @remarks
 * Предоставляет базовые операции для работы со сценой Three.js:
 * - получение сцены
 * - добавление объектов на сцену
 * - удаление объектов со сцены
 *
 * Используется модулями и хендлерами, которым нужно управлять
 * объектами на сцене (например, добавление мешей, света, вспомогательных элементов).
 *
 * @see {@link SceneApi} - реализация этого интерфейса
 * @see {@link IRendererSceneAccess} - низкоуровневый доступ к сцене (internal)
 *
 * @internal
 * @interface
 */
export interface ISceneApi {
  /**
   * Возвращает сцену рендерера.
   *
   * @returns THREE.Scene - сцена Three.js
   *
   * @example
   * ```typescript
   * const scene = sceneApi.getScene();
   * ```
   *
   * @internal
   * @method
   */
  getScene(): THREE.Scene;

  /**
   * Добавляет объект на сцену.
   *
   * @param object - объект Three.js для добавления (Mesh, Light, Group и т.д.)
   *
   * @remarks
   * Объект будет виден на сцене после вызова этого метода.
   * Если объект уже добавлен, он не будет продублирован.
   *
   * @example
   * ```typescript
   * const mesh = new THREE.Mesh(geometry, material);
   * sceneApi.addToScene(mesh);
   * ```
   *
   * @internal
   * @method
   */
  addToScene(object: THREE.Object3D): void;

  /**
   * Удаляет объект со сцены.
   *
   * @param object - объект Three.js для удаления
   *
   * @remarks
   * Объект перестаёт отображаться на сцене.
   *
   * @example
   * ```typescript
   * sceneApi.removeFromScene(mesh);
   * ```
   *
   * @internal
   * @method
   */
  removeFromScene(object: THREE.Object3D): void;

  /**
   * Добавляет объект в сцену и (опционально) выставляет ему слой.
   *
   * @param object - Объект, который нужно добавить в сцену.
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
   * @method
   */
  addObject(object: THREE.Object3D, layer?: number): void;
}
