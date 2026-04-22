// Core
import * as THREE from 'three';

/**
 * Низкоуровневый доступ к сцене рендерера.
 *
 * @remarks
 * Этот интерфейс предоставляет доступ к сцене Three.js.
 * Используется внутренними API-слоями (например, `SceneApi`)
 * для получения доступа к сцене без необходимости знать конкретную
 * реализацию рендерера.
 *
 * @see {@link Renderer} - класс, реализующий этот интерфейс
 *
 * @public
 * @interface
 */
export interface IRendererSceneAccess {
  /**
   * Возвращает сцену рендерера.
   *
   * @returns THREE.Scene - сцена Three.js
   *
   * @remarks
   * Сцена содержит все объекты, которые рендерятся на экране.
   * Через неё можно добавлять, удалять и модифицировать объекты.
   *
   * @example
   * ```typescript
   * const scene = sceneAccess.getScene();
   *
   * // Добавление объекта
   * scene.add(myMesh);
   *
   * // Поиск объекта по имени
   * const obj = scene.getObjectByName('myObject');
   *
   * // Удаление объекта
   * scene.remove(obj);
   * ```
   *
   * @public
   * @method
   */
  getScene(): THREE.Scene;
}
