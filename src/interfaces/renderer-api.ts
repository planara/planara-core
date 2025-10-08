// Types
import type { OGLRenderingContext } from 'ogl';

/**
 * Интерфейс API рендерера.
 * Предоставляет доступ к базовым возможностям ядра рендерера,
 */
export interface IRendererApi {
  /**
   * Возвращает WebGL контекст рендерера.
   *
   * @returns Контекст WebGL (OGLRenderingContext) текущей сцены.
   */
  getContext(): OGLRenderingContext;
}
