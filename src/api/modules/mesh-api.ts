// Core
import * as THREE from 'three';
// IOC
import { inject, injectable } from 'tsyringe';
// Interfaces
import type { IMeshApi } from '@/interfaces/api';

/**
 * API для управления мешами (фигурами) на сцене.
 *
 * **Назначение:**
 * - Предоставляет хендлерам и менеджерам унифицированный интерфейс для работы с мешами
 * - Скрывает конкретную реализацию {@link `SceneModule`}
 *
 * **Используется:**
 * - Хендлерами инструментов ({@link `TranslateToolHandler`}, {@link `RotateToolHandler`} и др.)
 * - Хэндлерами сцены при необходимости получить список мешей
 *
 * @see {@link IMeshApi} - интерфейс, который реализует этот класс
 * @see {@link SceneModule} - реальная реализация операций с мешами
 *
 * @internal
 * @class
 */
@injectable()
export class MeshApi implements IMeshApi {
  /** @constructor */
  public constructor(@inject('SceneModule') private readonly _sceneModule: IMeshApi) {}

  public addMesh(mesh: THREE.Mesh): void {
    this._sceneModule.addMesh(mesh);
  }

  public addMeshes(meshes: THREE.Mesh[]): void {
    this._sceneModule.addMeshes(meshes);
  }

  public removeMesh(mesh: THREE.Mesh): void {
    this._sceneModule.removeMesh(mesh);
  }

  public removeMeshes(meshes: THREE.Mesh[]): void {
    this._sceneModule.removeMeshes(meshes);
  }

  public getMeshes(): THREE.Mesh[] {
    return this._sceneModule.getMeshes();
  }
}
