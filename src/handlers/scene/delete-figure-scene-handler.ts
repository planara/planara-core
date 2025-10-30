// Core
import * as THREE from 'three';
// Interfaces
import type { ISceneHandler } from '../../interfaces/handler/scene-handler';
import type { IMeshApi } from '../../interfaces/api/mesh-api';
// Types
import { SceneMode } from '@planara/types';
// IOC
import { inject, injectable } from 'tsyringe';
import type { IEditorStore } from '../../interfaces/store/editor-store';
// Helpers
import { isMesh } from '../../utils/helpers';

/**
 * Хендлер для удаления фигур со сцены.
 * Управляет сценой через RendererApi.
 * @internal
 */
@injectable()
export class DeleteFigureSceneHandler implements ISceneHandler {
  /** Режим редактирования сцены */
  public readonly mode: SceneMode = SceneMode.DeleteFigure;

  /** Последняя удаленная фигура, сохраняем для отката через `ctrl + z` */
  private _lastDeletedMesh: THREE.Mesh | null = null;

  public constructor(
    @inject('RendererApi') private _api: IMeshApi,
    @inject('IEditorStore') private _store: IEditorStore,
  ) {}

  public handle(): void {
    // Получение последнего выбранного объекта
    const object = this._store.getSelectedObject();

    // Если выбранный объект является фигурой
    if (isMesh(object)) {
      // Удаление фигуры
      this._api.removeMesh(object);
      // Откат выбранной фигуры, чтобы снять transform controls
      this._store.setSelectedObject(null);
      // Сохранение последней удаленной фигуры для отката
      this._lastDeletedMesh = object;
    }
  }

  /** Срабатывает только на `ctrl + z`. */
  public rollback(): void {
    // Если удаляли фигуру со сцены
    if (this._lastDeletedMesh) {
      this._api.addMesh(this._lastDeletedMesh);
      // Очистка сохраненной фигуры
      this._lastDeletedMesh = null;
    }
  }

  /** Освобождает ресурсы хендлера. */
  public dispose(): Promise<void> | void {
    // Очистка сохраненной фигуры
    this._lastDeletedMesh = null;
  }
}
