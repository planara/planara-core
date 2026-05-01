// IOC
import { inject, injectable } from 'tsyringe';
// Types
import { SceneMode } from '@planara/types';
// Interfaces
import type { ISceneHandler } from '@/interfaces/handler';
import type { IMeshApi } from '@/interfaces/api';
import type { IValidator } from '@/interfaces/validator';
// Decorators
import { useValidator } from '@/decorators';
// Helpers
import { createMeshesFromObjContent } from '@/utils';

/**
 * Хендлер для загрузки сцены из файла.
 *
 * @internal
 * @class
 */
@injectable()
export class LoadSceneHandler implements ISceneHandler {
  /** Режим редактирования сцены */
  public readonly mode: SceneMode = SceneMode.Load;

  public constructor(
    @inject('IMeshApi') private _api: IMeshApi,
    @inject('ObjValidator') private _validator: IValidator,
  ) {}

  /** Загрузка всей сцены из файла. */
  @useValidator((self) => self._validator)
  public handle(content: string): void {
    // Очистка сцены
    const meshes = [...this._api.getMeshes()];
    this._api.removeMeshes(meshes);

    // Загрузка мешей из файла
    const loadedMeshes = createMeshesFromObjContent(content);
    this._api.addMeshes(loadedMeshes);
  }

  public rollback(): void {}

  /** Освобождает ресурсы хендлера. */
  public dispose(): Promise<void> | void {}
}
