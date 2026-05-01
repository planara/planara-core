// IOC
import type { Disposable } from 'tsyringe';

/**
 * Интерфейс для контроллера, управляющего жизненным циклом модулей.
 *
 * @remarks
 * Контроллер отвечает за:
 * - инициализацию модулей (`IRuntimeModule`)
 * - запуск цикла рендеринга
 * - обновление модулей каждый кадр (`IUpdatableModule`)
 * - рендеринг модулей (`IRenderableModule`)
 * - остановку и очистку ресурсов
 *
 * @public
 * @interface
 */
export interface IController extends Disposable {
  /**
   * Запускает контроллер.
   *
   * @remarks
   * Инициализирует все модули и запускает цикл рендеринга.
   *
   * @public
   * @method
   */
  start(): void;

  /**
   * Останавливает контроллер.
   *
   * @remarks
   * Останавливает цикл рендеринга и освобождает ресурсы.
   *
   * @public
   * @method
   */
  stop(): void;
}
