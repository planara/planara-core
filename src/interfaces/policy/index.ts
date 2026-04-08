/**
 * Интерфейс политики.
 *
 * @remarks
 * Политика проверяет, разрешено ли действие в текущем контексте.
 *
 * @public
 * @interface
 */
export interface IPolicy {
  /**
   * Проверка политики.
   *
   * @param args - параметры, необходимые для проверки
   *
   * @public
   * @method
   */
  check(...args: unknown[]): void;
}
