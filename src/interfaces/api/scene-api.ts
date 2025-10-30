// Core
import * as THREE from 'three';

/**
 * Мини-API для взаимодействия со сценой и слоями камеры.
 *
 * @remarks
 * Абстрагирует прямой доступ к `THREE.Scene`/`THREE.Camera`, позволяя
 * хендлерам добавлять/удалять объекты и управлять видимостью слоёв.
 * Рекомендуется использовать совместно с константами слоёв
 * (например, `MESH_LAYER`, `LINE_LAYER`, `OVERLAY_LAYER`).
 *
 * @example
 * // Добавить оверлей на слой подсветок и убедиться, что камера его видит:
 * sceneApi.add(overlayLine, OVERLAY_LAYER);
 * sceneApi.enableCameraLayer(OVERLAY_LAYER);
 */
export interface ISceneApi {
  /**
   * Добавляет объект в сцену.
   *
   * @param obj - Объект для добавления (`THREE.Object3D`).
   * @param layer - (Опц.) Слой, который следует выставить объекту перед добавлением.
   *
   * @remarks
   * Если `layer` указан, реализация должна вызвать `obj.layers.set(layer)` или
   * эквивалентную логику, прежде чем поместить объект в сцену.
   */
  addObject(obj: THREE.Object3D, layer?: number): void;

  /**
   * Удаляет объект из сцены.
   *
   * @param obj - Объект для удаления.
   *
   * @remarks
   * Реализация может дополнительно освобождать ресурсы (материалы, геометрию)
   * по соглашению, но это не обязательно для интерфейса.
   */
  removeObject(obj: THREE.Object3D): void;

  /**
   * Включает указанный слой для активной камеры,
   * чтобы объекты на этом слое были видимы.
   *
   * @param layer - Номер слоя, который требуется включить.
   *
   * @example
   * // Показать оверлеи подсветки:
   * sceneApi.enableCameraLayer(OVERLAY_LAYER);
   */
  enableCameraLayer(layer: number): void;
}
