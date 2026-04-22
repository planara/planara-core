// Interfaces
import type { Disposable } from 'tsyringe';
// Types
import type { FeatureType } from '../../types/feature/feature-type';

/**
 * Общий интерфейс для всех менеджеров в хабе.
 * Каждый менеджер отвечает за одну фичу.
 *
 * @internal
 * @interface
 */
export interface IManager extends Disposable {
  /**
   * Тип фичи, за которую отвечает менеджер.
   *
   * @member
   */
  type: FeatureType;

  /**
   * Выполняет основное действие менеджера.
   *
   * @method
   */
  manage(...args: unknown[]): void;
}
