// IOC
import { inject, injectable } from 'tsyringe';
// Interfaces
import type { IRenderableModule } from '@/interfaces/module';
import type { ICameraApi, IDomApi, IRendererApi } from '@/interfaces/api';
// Extensions
import { CameraAxesGizmo } from '@planara/three';

/**
 * Модуль для отображения вспомогательных гизмо (осей, ориентации камеры и т.д.).
 *
 * @remarks
 * Отвечает за отрисовку дополнительных визуальных элементов поверх сцены.
 *
 * Модуль реализует:
 * - `IRuntimeModule` — для инициализации и очистки
 * - `IRenderableModule` — для кастомного рендеринга поверх сцены
 *
 * @see {@link IRuntimeModule} - управление жизненным циклом
 * @see {@link IRenderableModule} - кастомный рендеринг
 * @see {@link CameraAxesGizmo} - конкретная реализация гизмо
 *
 * @internal
 * @class
 */
@injectable()
export class GizmoModule implements IRenderableModule {
  /** Gizmo для управления отображением perspective camera */
  private _cameraGizmo: CameraAxesGizmo | null = null;

  public constructor(
    @inject('ICameraApi') private _cameraApi: ICameraApi,
    @inject('IDomApi') private _domApi: IDomApi,
    @inject('IRendererAccess') private _rendererApi: IRendererApi,
  ) {}

  public init(): void {
    // Камера
    const camera = this._cameraApi.getCamera();
    // Рендерер
    const renderer = this._rendererApi.getRenderer();

    // Гизмо осей перспективной камеры
    this._cameraGizmo = new CameraAxesGizmo(renderer, camera, {
      size: 96, // Размер квадрата
      margin: 36, // Отступы по сторонам (снизу и справа)
    });
  }

  public render(): void {
    // Получение canvas
    const canvas = this._domApi.getCanvas();

    this._cameraGizmo?.render(canvas.width, canvas.height);
  }

  /** Освобождение ресурсов модуля */
  public dispose(): Promise<void> | void {
    this._cameraGizmo?.dispose();
    this._cameraGizmo = null;
  }
}
