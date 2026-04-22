/**
 * Низкоуровневый доступ к DOM-элементам рендерера.
 *
 * @remarks
 * Этот интерфейс предоставляет доступ к canvas и DOM-элементу рендерера.
 * Используется внутренними API-слоями (например, `DomApi`)
 * для получения доступа к DOM без необходимости знать конкретную реализацию рендерера.
 *
 * @see {@link Renderer} - класс, реализующий этот интерфейс
 *
 * @public
 * @interface
 */
export interface IRendererDomAccess {
  /**
   * Возвращает canvas-элемент редактора.
   *
   * @remarks
   * Canvas используется для рендеринга 3D-сцены.
   *
   * @returns HTMLCanvasElement - canvas элемент
   *
   * @example
   * ```typescript
   * const canvas = domAccess.getCanvas();
   * ```
   *
   * @public
   */
  getCanvas(): HTMLCanvasElement;

  /**
   * Возвращает DOM-элемент рендерера.
   *
   * @remarks
   * Обычно это тот же canvas, но в некоторых случаях может быть
   * другим элементом (например, div-обёрткой). Используется для
   * подписки на события ввода (mousemove, click, dblclick и т.д.).
   *
   * @returns HTMLElement - DOM-элемент для подписки на события
   *
   * @example
   * ```typescript
   * const domElement = domAccess.getDomElement();
   * ```
   *
   * @public
   * @method
   */
  getDomElement(): HTMLElement;
}
