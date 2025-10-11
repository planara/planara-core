// Interfaces
import type { IMeshApi } from '../interfaces/api/mesh-api';
import type { IRendererApi } from '../interfaces/api/renderer-api';
// IOC
import { inject, injectable } from 'tsyringe';
// Types
import type { Mesh, MeshRenderCallback, OGLRenderingContext, Program } from 'ogl';
import type { EditorRenderer } from '../core/editor-renderer';

/**
 * API для EditorRenderer
 * @internal
 */
@injectable()
export class RendererApi implements IMeshApi, IRendererApi {
  constructor(@inject('EditorRenderer') private _renderer: EditorRenderer) {}

  public addMesh(mesh: Mesh): void {
    this._renderer.addMesh(mesh);
  }

  public addMeshes(meshes: Mesh[]): void {
    for (const mesh of meshes) {
      this._renderer.addMesh(mesh);
    }
  }

  public removeMesh(mesh: Mesh): void {
    this._renderer.removeMesh(mesh);
  }

  public removeMeshes(meshes: Mesh[]): void {
    for (const mesh of meshes) {
      this._renderer.removeMesh(mesh);
    }
  }

  public getMeshes(): Mesh[] {
    return this._renderer.getMeshes();
  }

  public getContext(): OGLRenderingContext {
    return this._renderer.getContext();
  }

  public getProgram(): Program {
    return this._renderer.getProgram();
  }

  public setMeshBeforeRender(mesh: Mesh, f: MeshRenderCallback): void {
    this._renderer.setMeshBeforeRender(mesh, f);
  }
}
