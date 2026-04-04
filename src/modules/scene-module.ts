// Core
import * as THREE from 'three';
// IOC
import { inject, injectable } from 'tsyringe';
// Extensions
import { SymmetricAxesHelper } from '@planara/three';
// Interfaces
import type { IRuntimeModule } from '../interfaces/module/runtime-module';
import type { ISceneApi } from '../interfaces/api/scene-api';
import type { IMeshApi } from '../interfaces/api/mesh-api';

/**
 * Модуль управления сценой, используется для добавления/удаления фигур,
 * настройки необходимых хелперов на сцене (сетка, оси, свет)
 *
 * @internal
 * @class
 */
@injectable()
export class SceneModule implements IRuntimeModule, IMeshApi {
  /** Объекты редактора, участвующие в raycast и редактировании */
  private _meshes: THREE.Mesh[] = [];

  /** Сетка сцены */
  private _grid: THREE.GridHelper | null = null;

  /** Оси сцены */
  private _axes: THREE.Object3D | null = null;

  /** Базовый свет сцены */
  private _light: THREE.HemisphereLight | null = null;

  public constructor(@inject('ISceneApi') private _api: ISceneApi) {}

  public init(): void {
    // Сетка
    this._grid = new THREE.GridHelper(10, 10);
    this._grid.position.y = -0.001;
    this._api.addToScene(this._grid);

    // Оси
    this._axes = new SymmetricAxesHelper(6);
    this._api.addToScene(this._axes);

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

    // Сетка
    if (this._grid) {
      this._api.removeFromScene(this._grid);
      this._grid.geometry.dispose();
      (this._grid.material as THREE.Material).dispose();
      this._grid = null;
    }

    // Оси
    if (this._axes) {
      this._api.removeFromScene(this._axes);
      this._axes = null;
    }

    // Свет
    if (this._light) {
      this._api.removeFromScene(this._light);
      this._light = null;
    }
  }
}
