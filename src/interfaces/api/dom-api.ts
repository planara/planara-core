/**
 * Высокоуровневый API для доступа к DOM-элементам рендерера.
 *
 * @remarks
 * Предоставляет доступ к canvas и DOM-элементу рендерера.
 * Используется модулями и хендлерами, которым нужно взаимодействовать
 * с DOM (например, для подписки на события мыши или настройки canvas).
 *
 * @see {@link DomApi} - реализация этого интерфейса
 * @see {@link IRendererDomAccess} - низкоуровневый доступ к DOM (internal)
 *
 * @internal
 * @interface
 */
export interface IDomApi {
  /**
   * Возвращает canvas-элемент редактора.
   *
   * @returns HTMLCanvasElement - canvas элемент
   *
   * @example
   * ```typescript
   * const canvas = domApi.getCanvas();
   * ```
   *
   * @internal
   * @method
   */
  getCanvas(): HTMLCanvasElement;

  /**
   * Возвращает DOM-элемент рендерера.
   *
   * @remarks
   * Обычно это тот же canvas, но может быть другим элементом
   * (например, div-обёрткой). Используется для подписки на события ввода.
   *
   * @returns HTMLElement - DOM-элемент для подписки на события
   *
   * @example
   * ```typescript
   * const domElement = domApi.getDomElement();
   * ```
   *
   * @internal
   * @method
   */
  getDomElement(): HTMLElement;
}
