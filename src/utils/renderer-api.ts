// Interfaces
import type { IMeshApi } from '../interfaces/mesh-api';
import type { IRendererApi } from '../interfaces/renderer-api';
// IOC
import { inject, injectable } from 'tsyringe';
// Types
import type { Mesh, OGLRenderingContext } from 'ogl';
import type { EditorRenderer } from '../core/editor-renderer';

/**
 * API для EditorRenderer
 * @internal
 */
@injectable()
export class RendererApi implements IMeshApi, IRendererApi {
  constructor(@inject('EditorRenderer') private renderer: EditorRenderer) {}

  public addMesh(mesh: Mesh): void {
    this.renderer.addMesh(mesh);
  }

  public addMeshes(meshes: Mesh[]): void {
    for (const mesh of meshes) {
      this.renderer.addMesh(mesh);
    }
  }

  public removeMesh(mesh: Mesh): void {
    this.renderer.removeMesh(mesh);
  }

  public removeMeshes(meshes: Mesh[]): void {
    for (const mesh of meshes) {
      this.renderer.removeMesh(mesh);
    }
  }

  public getMeshes(): Mesh[] {
    return this.renderer.getMeshes();
  }

  public getContext(): OGLRenderingContext {
    return this.renderer.getContext();
  }
}
