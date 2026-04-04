// Interfaces
import type { IRuntimeModule } from './runtime-module';
import type { IRenderable } from '../api/renderer/renderable';

/**
 * Интерфейс для модулей, требующих кастомного рендеринга.
 *
 * @remarks
 * Некоторые модули должны рендерить дополнительную графику поверх основной сцены:
 * - `GizmoModule` — отображение осей координат (CameraAxesGizmo)
 * - оверлеи, подсказки, вспомогательные элементы
 *
 * В отличие от {@link IUpdatableModule}, который обновляет состояние,
 * `IRenderableModule` отвечает именно за отрисовку дополнительных элементов
 * **после** основного рендера сцены.
 *
 * Оркестрацией вызовов `render()` занимается `EditorRenderer`,
 * который получает все модули через `@injectAll('IRenderableModule')`.
 *
 * @see {@link IRuntimeModule} - для одноразовой инициализации
 * @see {@link IUpdatableModule} - для модулей с периодическим обновлением
 * @see {@link GizmoModule} - пример реализации
 *
 * @internal
 * @interface
 */
export interface IRenderableModule extends IRuntimeModule, IRenderable {}
