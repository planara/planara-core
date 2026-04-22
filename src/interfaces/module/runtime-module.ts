// Interfaces
import type { Disposable } from 'tsyringe';

/**
 * Базовый интерфейс для всех runtime-модулей редактора.
 *
 * @remarks
 * Модули — это независимые компоненты, которые управляют определёнными аспектами редактора:
 * - управление камерой и контролами (`ControlsModule`)
 * - управление сценой и объектами (`SceneModule`)
 * - обработка выделения (`RaycasterModule`)
 * - отображение вспомогательных элементов (`GizmoModule`)
 *
 * Все модули проходят единый жизненный цикл:
 * 1. `init()` — инициализация модуля (подписки, создание объектов)
 * 2. `dispose()` — освобождение ресурсов (отписки, очистка)
 *
 * Оркестрацией модулей занимается {@link EditorHub}.
 *
 * @see {@link ControlsModule} - пример реализации
 * @see {@link SceneModule} - пример реализации
 * @see {@link RaycastModule} - пример реализации
 *
 * @internal
 * @interface
 */
export interface IRuntimeModule extends Disposable {
  /**
   * Инициализирует модуль.
   *
   * @remarks
   * Вызывается один раз при старте редактора.
   * Здесь модуль должен:
   * - создавать необходимые объекты
   * - подписываться на события
   * - регистрировать обработчики
   *
   * Порядок инициализации модулей не важен, так как модули
   * не должны зависеть друг от друга на этапе `init()`.
   * Взаимодействие происходит через API и EventBus после инициализации.
   *
   * @example
   * ```typescript
   * public init(): void {
   *   // Создание контролов
   *   this._orbit = new OrbitControls(...);
   *   // Подписка на события
   *   this._eventBus.on(EventTopics.SelectClick, this._onClick);
   * }
   * ```
   *
   * @internal
   */
  init(): void;
}
