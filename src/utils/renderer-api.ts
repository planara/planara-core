// Core
import * as THREE from 'three';
// Interfaces
import type { IMeshApi } from '../interfaces/api/mesh-api';
// IOC
import { inject, injectable } from 'tsyringe';
// Types
import type { EditorRenderer } from '../core/editor-renderer';

/**
 * API для EditorRenderer
 * @internal
 */
@injectable()
export class RendererApi implements IMeshApi {
  constructor(@inject('EditorRenderer') private _renderer: EditorRenderer) {}

  public addMesh(mesh: THREE.Mesh): void {
    this._renderer.addMesh(mesh);
  }

  public addMeshes(meshes: THREE.Mesh[]): void {
    for (const mesh of meshes) {
      this._renderer.addMesh(mesh);
    }
  }

  public removeMesh(mesh: THREE.Mesh): void {
    this._renderer.removeMesh(mesh);
  }

  public removeMeshes(meshes: THREE.Mesh[]): void {
    for (const mesh of meshes) {
      this._renderer.removeMesh(mesh);
    }
  }

  public getMeshes(): THREE.Mesh[] {
    return this._renderer.getMeshes();
  }
}
