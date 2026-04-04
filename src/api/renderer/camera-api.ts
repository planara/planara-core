// Core
import * as THREE from 'three';
// IOC
import { inject, injectable } from 'tsyringe';
// Interfaces
import type { ICameraApi } from '../../interfaces/api/camera-api';
import type { IRendererCameraAccess } from '../../interfaces/api/renderer/renderer-camera-access';

/**
 * Реализация API для управления камерой.
 *
 * @remarks
 * Предоставляет высокоуровневые методы для работы с камерой:
 * - получение экземпляра камеры
 * - включение/выключение слоёв отображения
 *
 * @see {@link ICameraApi} - интерфейс, который реализует этот класс
 * @see {@link IRendererCameraAccess} - низкоуровневый доступ к камере
 * @see {@link Renderer} - рендерер, предоставляющий доступ к камере
 *
 * @internal
 * @class
 */
@injectable()
export class CameraApi implements ICameraApi {
  public constructor(
    @inject('IRendererCameraAccess') private _cameraAccessApi: IRendererCameraAccess,
  ) {}

  public getCamera(): THREE.Camera {
    return this._cameraAccessApi.getCamera();
  }

  public enableCameraLayer(layer: number): void {
    this._cameraAccessApi.getCamera().layers.enable(layer);
  }

  public disableCameraLayer(layer: number): void {
    this._cameraAccessApi.getCamera().layers.disable(layer);
  }
}
