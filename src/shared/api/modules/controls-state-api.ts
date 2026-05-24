// IOC
import { inject, injectable } from 'tsyringe';
// Interfaces
import type { IControlsStateApi } from '@/interfaces/api';

/**
 * API для получения состояния элементов управления сценой.
 *
 * **Назначение:**
 * - Предоставляет хендлерам и менеджерам унифицированный интерфейс для получения состояния контролов
 * - Скрывает конкретную реализацию {@link ControlsModule}
 *
 * **Используется:**
 * - `RaycasterModule` для проверки, нужно ли обрабатывать события ввода
 * - Другими модулями, которым важно знать состояние контролов
 *
 * @internal
 * @class
 */
@injectable()
export class ControlsStateApi implements IControlsStateApi {
  /** @constructor */
  public constructor(
    @inject('ControlsModule') private readonly _controlsModule: IControlsStateApi,
  ) {}

  public isOrbitInteracting(): boolean {
    return this._controlsModule.isOrbitInteracting();
  }

  public isTransformDragging(): boolean {
    return this._controlsModule.isTransformDragging();
  }
}
