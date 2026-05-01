// IOC
import { inject, injectable } from 'tsyringe';
// Types
import type { SelectMode } from '@planara/types';
// Interfaces
import type { IRaycastApi } from '@/interfaces/api';

/**
 * API для управления raycast (выделением геометрии).
 *
 * **Назначение:**
 * - Предоставляет менеджерам и хендлерам унифицированный интерфейс для настройки raycast
 * - Скрывает конкретную реализацию ({@link `RaycastModule`})
 * - Позволяет легко подменить реализацию (например, для тестирования)
 *
 * **Используется:**
 * - {@link `SelectManager`} — для переключения режима выделения при смене инструмента
 * - {@link `MeshSelectHandler`}, {@link `EdgeSelectHandler`}, {@link `VertexSelectHandler`}  — для установки режима перед обработкой
 *
 * @see {@link IRaycastApi} - интерфейс, который реализует этот класс
 * @see {@link RaycastModule} - реальная реализация raycast
 * @see {@link SelectManager} - менеджер, использующий этот API
 *
 * @internal
 * @class
 */
@injectable()
export class RaycastApi implements IRaycastApi {
  /** @constructor */
  public constructor(@inject('RaycastModule') private readonly _raycastModule: IRaycastApi) {}

  public setRaycastMode(mode: SelectMode): void {
    this._raycastModule.setRaycastMode(mode);
  }
}
