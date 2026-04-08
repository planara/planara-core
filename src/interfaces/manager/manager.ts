// Interfaces
import type { Disposable } from 'tsyringe';

/**
 * Общий интерфейс для всех менеджеров в хабе.
 * Каждый менеджер отвечает за одну фичу.
 *
 * @public
 * @interface
 */
export interface IManager extends Disposable {
  /**
   * Выполняет основное действие менеджера.
   */
  manage(...args: unknown[]): void;
}
