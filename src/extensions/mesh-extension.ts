// Core
import { Mesh } from 'ogl';
// Types
import type { OGLRenderingContext } from 'ogl/types/core/Renderer';
import type { MeshOptions } from 'ogl/types/core/Mesh';

/**
 * Расширение для Mesh с добавлением поля isHit, необходимого для raycast
 * @public
 */
export class EditorMesh extends Mesh {
  public isHit!: boolean;

  constructor(gl: OGLRenderingContext, options?: Partial<MeshOptions>) {
    super(gl, options);

    this.isHit = false;
  }
}
