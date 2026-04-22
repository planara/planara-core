// Core
import * as THREE from 'three';

/**
 * Низкоуровневый доступ к WebGLRenderer.
 *
 * @remarks
 * Этот интерфейс **реализуется самим рендерером** (`Renderer`).
 * Предоставляет прямой доступ к WebGLRenderer Three.js.
 *
 * Используется **только внутренними API-слоями** (например, `RendererApi`),
 * но не модулями напрямую.
 *
 * @see {@link Renderer} - класс, реализующий этот интерфейс
 *
 * @public
 * @interface
 */
export interface IRendererAccess {
  /**
   * Возвращает WebGLRenderer.
   *
   * @returns THREE.WebGLRenderer - рендерер Three.js
   *
   * @example
   * ```typescript
   * // Использование в RendererApi
   * const renderer = this._rendererAccess.getRenderer();
   * ```
   *
   * @public
   * @method
   */
  getRenderer(): THREE.WebGLRenderer;
}
