// Interfaces
import type { IRuntimeModule } from './runtime-module';

/**
 * Интерфейс для модулей, требующих периодического обновления.
 *
 * @remarks
 * Некоторые модули должны выполнять код каждый кадр анимации:
 * - `ControlsModule` — обновление OrbitControls (`update()`)
 * - анимации, физика, кастомные эффекты
 *
 * В отличие от {@link IRuntimeModule}, который инициализируется один раз,
 * модули с `IUpdatableModule` получают вызов `update()` каждый кадр
 * через цикл рендеринга.
 *
 * Оркестрацией вызовов `update()` занимается `EditorRenderer`.
 *
 * @see {@link IRuntimeModule} - для одноразовой инициализации
 * @see {@link IRenderableModule} - для модулей с кастомным рендером
 * @see {@link ControlsModule} - пример реализации
 *
 * @internal
 */
export interface IUpdatableModule extends IRuntimeModule {
  /**
   * Вызывается каждый кадр перед рендером.
   *
   * @remarks
   * Здесь модуль должен обновлять своё состояние:
   * - обновлять контролы (`OrbitControls.update()`)
   * - пересчитывать анимации
   * - проверять условия и реагировать на изменения
   *
   * Важно: метод не должен выполнять тяжёлые операции,
   * чтобы не снижать производительность.
   *
   * @example
   * ```typescript
   * public update(): void {
   *   this._orbit.update();
   *   this._updateAnimations();
   *   this._checkForChanges();
   * }
   * ```
   *
   * @internal
   */
  update(): void;
}
