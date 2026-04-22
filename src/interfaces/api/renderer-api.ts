// Core
import * as THREE from 'three';

/**
 * API для доступа к WebGLRenderer.
 *
 * @remarks
 * Этот интерфейс **реализуется прослойкой** (`RendererApi`), а не самим рендерером.
 * Предоставляет тот же функционал, но через верхнеуровневый API.
 *
 * Используется **модулями** (например, `GizmoModule`), которым нужен доступ
 * к WebGLRenderer, но которые не должны знать о конкретной реализации рендерера.
 *
 * @see {@link RendererApi} - реализация этого интерфейса
 * @see {@link IRendererAccess} - нижнеуровневый доступ (реализуется рендерером)
 *
 * @internal
 * @interface
 */
export interface IRendererApi {
  /**
   * Возвращает WebGLRenderer.
   *
   * @returns THREE.WebGLRenderer - рендерер Three.js
   *
   * @example
   * ```typescript
   * const renderer = rendererApi.getRenderer();
   * renderer.setSize(width, height);
   * ```
   *
   * @internal
   * @method
   */
  getRenderer(): THREE.WebGLRenderer;
}
