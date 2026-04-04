// Core
import * as THREE from 'three';

/**
 * Предоставляет низкоуровневый доступ к камере рендерера.
 *
 * Этот интерфейс используется внутренними модулями (например, `CameraApi`) для
 * получения прямого доступа к камере `Three.js`. Он не содержит логики управления
 * камерой — только доступ к объекту.
 *
 * @remarks
 * В отличие от `ICameraApi`, который предоставляет высокоуровневые операции
 * (включение слоёв, настройка параметров), этот интерфейс нужен только для
 * чтения камеры.
 *
 * @see {@link Renderer} - класс, который реализует этот интерфейс
 *
 * @public
 * @interface
 */
export interface IRendererCameraAccess {
  /**
   * Возвращает камеру рендерера.
   *
   * @returns Камера Three.js.
   *
   * @example
   * ```typescript
   * const camera = cameraAccess.getCamera();
   * camera.position.set(5, 5, 5);
   * camera.lookAt(0, 0, 0);
   * ```
   *
   * @public
   * @method
   */
  getCamera(): THREE.Camera;
}
