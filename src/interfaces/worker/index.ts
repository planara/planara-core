// IOC
import type { Disposable } from 'tsyringe';

/**
 * Интерфейс для воркера, управляющего жизненным циклом модулей.
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
export interface IWorker extends Disposable {
  /**
   * Запускает воркер.
   *
   * @remarks
   * Инициализирует все модули и запускает цикл рендеринга.
   *
   * @public
   * @method
   */
  start(): void;

  /**
   * Останавливает воркер.
   *
   * @remarks
   * Останавливает цикл рендеринга и освобождает ресурсы.
   *
   * @public
   * @method
   */
  stop(): void;
}
