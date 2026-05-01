/**
 * Интерфейс валидатора.
 *
 * @remarks
 * Валидатор проверяет входные аргументы метода.
 *
 * @public
 * @interface
 */
export interface IValidator {
  /**
   * Проверка аргументов.
   *
   * @param args - параметры, необходимые для проверки
   *
   * @public
   * @method
   */
  validate(...args: unknown[]): void;
}
