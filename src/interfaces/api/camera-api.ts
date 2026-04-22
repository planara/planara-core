// Core
import * as THREE from 'three';

/**
 * Низкоуровневый API доступа к камере renderer.
 * Используется internal runtime-модулями редактора.
 *
 * @internal
 * @interface
 */
export interface ICameraApi {
  /**
   * Возвращает экземпляр камеры.
   *
   * @returns Камера Three.js - {@link THREE.Camera}
   *
   * @example
   * ```typescript
   * const camera = cameraApi.getCamera();
   * console.log(camera.position);
   * ```
   *
   * @internal
   * @method
   */
  getCamera(): THREE.Camera;

  /**
   * Включает указанный слой для камеры.
   *
   * @param layer - номер слоя
   *
   * @remarks
   * Используется для отображения служебных объектов
   * без влияния на основной рендеринг.
   *
   * @example
   * ```typescript
   * // Включить слой для отображения оверлея
   * cameraApi.enableCameraLayer(OVERLAY_LAYER);
   * ```
   *
   * @see {@link disableCameraLayer} - выключение слоя
   *
   * @internal
   * @method
   */
  enableCameraLayer(layer: number): void;

  /**
   * Выключает указанный слой для камеры.
   *
   * @param layer - номер слоя
   *
   * @example
   * ```typescript
   * // Выключить слой оверлея
   * cameraApi.disableCameraLayer(OVERLAY_LAYER);
   * ```
   *
   * @see {@link enableCameraLayer} - включение слоя
   *
   * @internal
   * @method
   */
  disableCameraLayer(layer: number): void;
}
