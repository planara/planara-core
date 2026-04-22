// Types
import type { IResponse } from '../response';

/**
 * Интерфейс middleware в pipeline обработки команд редактора.
 *
 * @remarks
 * Middleware позволяет внедрять сквозную логику поверх вызова менеджера,
 * не изменяя реализацию самих менеджеров.
 *
 * Middleware образуют цепочку вызовов, в которой каждый элемент
 * получает функцию `next` для передачи управления следующему шагу pipeline.
 *
 * Возвращаемое значение:
 * - `null`, если выполнение завершилось без необходимости формировать ответ
 * - `IResponse`, если middleware сформировал ответ самостоятельно, например при перехвате исключения
 *
 * @internal
 * @interface
 */
export interface IMiddleware {
  /**
   * Выполняет шаг middleware и передаёт управление следующему
   * обработчику в pipeline.
   *
   * @param next - функция вызова следующего шага pipeline
   *
   * @returns результат выполнения текущего шага pipeline:
   * - `null`, если явный ответ не был сформирован
   * - `IResponse`, если middleware сформировал ответ самостоятельно
   *
   * @example
   * ```typescript
   * public async handle(next: () => Promise<IResponse | null>): Promise<IResponse | null> {
   *   try {
   *     return await next();
   *   } catch {
   *     return {
   *       type: ResponseType.Error,
   *       message: 'Unexpected error',
   *       blocked: true,
   *     };
   *   }
   * }
   * ```
   *
   * @public
   * @method
   */
  handle(next: () => IResponse | null): IResponse | null;
}
