// Core
import * as THREE from 'three';
// IOC
import { inject, injectable } from 'tsyringe';
// Interfaces
import type { IRuntimeModule } from '@/interfaces/module';
import type { ISceneApi, IMeshApi } from '@/interfaces/api';

/**
 * Модуль управления сценой, используется для добавления/удаления фигур
 *
 * @internal
 * @class
 */
@injectable()
export class ScenePreviewModule implements IRuntimeModule, IMeshApi {
  /** Объекты вьювера */
  private _meshes: THREE.Mesh[] = [];

  /** Базовый свет сцены */
  private _light: THREE.HemisphereLight | null = null;

  public constructor(@inject('ISceneApi') private _api: ISceneApi) {}

  public init(): void {
    // Свет
    this._light = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    this._api.addToScene(this._light);
  }

  public getMeshes(): THREE.Mesh[] {
    return this._meshes;
  }

  public addMesh(mesh: THREE.Mesh): void {
    // Пропуск дубликатов
    if (this._meshes.includes(mesh)) return;

    this._meshes.push(mesh);
    this._api.addToScene(mesh);
  }

  public removeMesh(mesh: THREE.Mesh): void {
    const index = this._meshes.indexOf(mesh);

    if (index >= 0) {
      this._meshes.splice(index, 1);
    }

    this._api.removeFromScene(mesh);
  }

  public addMeshes(meshes: THREE.Mesh[]): void {
    for (const mesh of meshes) {
      this.addMesh(mesh);
    }
  }

  public removeMeshes(meshes: THREE.Mesh[]): void {
    for (const mesh of meshes) {
      this.removeMesh(mesh);
    }
  }

  /** Освобождает ресурсы модуля */
  public dispose(): Promise<void> | void {
    // Объекты сцены
    for (const mesh of this._meshes) {
      this._api.removeFromScene(mesh);
    }
    this._meshes.length = 0;

    // Свет
    if (this._light) {
      this._api.removeFromScene(this._light);
      this._light = null;
    }
  }
}
