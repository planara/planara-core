// Core
import * as THREE from 'three';
// Types
import type { ToolType } from '@planara/types';
import type { TransformListener } from '../../types/listener/transform-listener';

/**
 * API для взаимодействия и настройки элементов управления сценой.
 *
 * @remarks
 * Предоставляет методы для работы с TransformControls:
 * - прикрепление/открепление контролов к объектам
 * - смена режима трансформации (перемещение, вращение, масштабирование)
 * - подписка на события изменения трансформации
 *
 * Используется хендлерами инструментов (Translate, Rotate, Scale)
 * для управления гизмо и отслеживания изменений.
 *
 * @see {@link ControlsModule} - реализация этого интерфейса
 * @see {@link TransformListener} - тип слушателя событий трансформации
 *
 * @internal
 * @interface
 */
export interface ITransformApi {
  /**
   * Прикрепляет Transform Controls к объекту сцены.
   *
   * @param object - объект Three.js, к которому нужно прикрепить контролы
   *
   * @remarks
   * После вызова этого метода на объекте появляется гизмо
   * (стрелки, дуги, квадраты), с помощью которого можно
   * перемещать, вращать или масштабировать объект.
   *
   * Если контролы уже прикреплены к другому объекту,
   * они автоматически переключатся на новый.
   *
   * @example
   * ```typescript
   * const mesh = sceneApi.getSelectedMesh();
   * controlsApi.attachTransform(mesh);
   * ```
   *
   * @internal
   * @method
   */
  attachTransform(object: THREE.Object3D): void;

  /**
   * Открепляет Transform Controls от текущего объекта.
   *
   * @remarks
   * Гизмо исчезает, объект перестаёт быть доступным для
   * интерактивной трансформации.
   *
   * Обычно вызывается при смене инструмента или при снятии выделения.
   *
   * @example
   * ```typescript
   * // При смене инструмента
   * public rollback(): void {
   *   this.controlsApi.detachTransform();
   * }
   * ```
   *
   * @internal
   * @method
   */
  detachTransform(): void;

  /**
   * Изменяет режим трансформации гизмо.
   *
   * @param mode - режим трансформации (Translate, Rotate, Scale)
   *
   * @remarks
   * В зависимости от режима, гизмо отображает разные контролы:
   * - `Translate` - стрелки для перемещения
   * - `Rotate` - дуги для вращения
   * - `Scale` - квадраты для масштабирования
   *
   * @example
   * ```typescript
   * // Переключение на режим вращения
   * controlsApi.setTransformMode(ToolType.Rotate);
   * ```
   *
   * @internal
   */
  setTransformMode(mode: ToolType): void;

  /**
   * Подписывает слушателя на события изменения трансформации.
   *
   * @param callback - функция, которая будет вызвана при изменении
   * @returns функция для отписки от события
   *
   * @remarks
   * Событие генерируется в процессе взаимодействия пользователя с гизмо
   * (перемещение, вращение, масштабирование).
   *
   * Возвращаемая функция позволяет отписаться от события:
   * ```typescript
   * const unsubscribe = controlsApi.onTransformChange(() => {
   *   console.log('Object transformed');
   * });
   *
   * // позже
   * unsubscribe();
   * ```
   *
   * @example
   * ```typescript
   * // Подписка на изменение трансформации
   * this.unsubscribe = this.controlsApi.onTransformChange(() => {
   *   this.store.notifySelectedTransformChange();
   * });
   * ```
   *
   * @internal
   * @method
   */
  onTransformChange(callback: TransformListener): () => void;
}
