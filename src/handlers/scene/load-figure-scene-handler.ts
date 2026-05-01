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
 * Хендлер для загрузки фигуры из файла.
 *
 * @internal
 * @class
 */
@injectable()
export class LoadFigureSceneHandler implements ISceneHandler {
  /** Режим редактирования сцены */
  public readonly mode: SceneMode = SceneMode.LoadFigure;

  public constructor(
    @inject('IMeshApi') private _api: IMeshApi,
    @inject('ObjValidator') private _validator: IValidator,
  ) {}

  /** Добавление фигур на сцену из файла. */
  @useValidator((self) => self._validator)
  public handle(content: string): void {
    // Загрузка мешей из файла
    const loadedMeshes = createMeshesFromObjContent(content);
    this._api.addMeshes(loadedMeshes);
  }

  public rollback(): void {}

  /** Освобождает ресурсы хендлера. */
  public dispose(): Promise<void> | void {}
}
