// Types
import type { Mesh, MeshRenderCallback, OGLRenderingContext, Program } from 'ogl';

/**
 * Интерфейс API рендерера.
 * Предоставляет доступ к базовым возможностям ядра рендерера
 * @internal
 */
export interface IRendererApi {
  /**
   * Возвращает WebGL контекст рендерера.
   *
   * @returns Контекст WebGL (OGLRenderingContext) текущей сцены.
   */
  getContext(): OGLRenderingContext;

  /**
   * Возвращает настройку для рендеринга.
   *
   * @returns Program для настройки рендеринга моделей.
   */
  getProgram(): Program;

  /**
   *
   * @param mesh
   * @param f
   */
  setMeshBeforeRender(mesh: Mesh, f: MeshRenderCallback): void;
}
