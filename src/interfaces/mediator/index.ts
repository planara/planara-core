// Types
import type { ICommand } from '../command';
import type { IResponse } from '../response';
import type { Disposable } from 'tsyringe';

/**
 * Интерфейс медиатора команд редактора.
 *
 * @remarks
 * Медиатор выступает промежуточным слоем между публичным API хаба
 * и менеджерами конкретных функциональных областей редактора.
 *
 * Основные задачи медиатора:
 * - принять команду от верхнего уровня
 * - определить менеджер, отвечающий за указанную фичу
 * - передать вызов в pipeline middleware
 * - вернуть итоговый ответ выполнения команды
 *
 * В штатном сценарии успешное выполнение команды может не формировать явный ответ и возвращать `null`.
 * Если в процессе обработки возникает исключение, например ошибка политики,
 * оно может быть преобразовано middleware в объект `IResponse`.
 *
 * @public
 * @interface
 */
export interface IMediator extends Disposable {
  /**
   * Отправляет команду на выполнение через middleware pipeline в соответствующий менеджер редактора.
   *
   * @param command - команда, содержащая тип фичи и аргументы вызова
   *
   * @returns результат выполнения команды:
   * - `null`, если команда выполнена успешно и не требует явного ответа
   * - `IResponse`, если в ходе обработки был сформирован ответ, например при ошибке или блокировке действия
   *
   * @example
   * ```typescript
   * const response = mediator.send({
   *   type: FeatureType.Tool,
   *   payload: [ToolType.Rotate],
   * });
   *
   * if (response?.blocked) {
   *   console.warn(response.message);
   * }
   * ```
   *
   * @public
   * @method
   */
  send(command: ICommand): IResponse | null;
}
