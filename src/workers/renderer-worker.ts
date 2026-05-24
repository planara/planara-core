// IOC
import { inject, injectable, injectAll } from 'tsyringe';
// Interfaces
import type { IWorker } from '@/interfaces/worker';
import type { IRenderable } from '@/interfaces/api/renderer';
import type {
  IRuntimeModule,
  IRenderableModule,
  IUpdatableModule,
  IObserverModule,
} from '@/interfaces/module';
/**
 * Воркер для оркестрации жизненного цикла модулей и цикла рендеринга.
 *
 * @remarks
 * Отвечает за:
 * - инициализацию всех модулей ({@link `IRuntimeModule`}, {@link `IUpdatableModule`}, {@link `IRenderableModule`})
 * - запуск анимационного цикла (`requestAnimationFrame`)
 * - вызов `update()` у модулей перед рендерингом
 * - вызов `render()` у рендерера
 * - вызов `render()` у модулей после рендеринга
 * - остановку цикла и очистку ресурсов
 *
 * @see {@link IWorker} - интерфейс воркера
 * @see {@link IRuntimeModule} - модули с инициализацией
 * @see {@link IUpdatableModule} - модули с обновлением каждый кадр
 * @see {@link IRenderableModule} - модули с кастомным рендерингом
 * @see {@link IRenderable} - рендерер
 *
 * @internal
 * @class
 */
@injectable()
export class RendererWorker implements IWorker {
  /**
   * ID анимационного цикла (для остановки)
   *
   * @private
   * @member
   */
  private _animationId: number | null = null;

  /**
   * Конструктор контроллера.
   *
   * @param _updatable - модули, требующие обновления каждый кадр
   * @param _renderable - модули, требующие кастомного рендеринга
   * @param _observers - модули, наблюдающие за приложением
   * @param _runtime - модули, требующие инициализации
   * @param _renderer - рендерер (должен реализовывать `IRenderable`)
   *
   * @internal
   * @constructor
   */
  constructor(
    @injectAll('IUpdatableModule', { isOptional: true })
    private readonly _updatable: IUpdatableModule[],

    @injectAll('IRenderableModule', { isOptional: true })
    private readonly _renderable: IRenderableModule[],

    @injectAll('IObserverModule', { isOptional: true })
    private readonly _observers: IObserverModule[],

    @injectAll('IRuntimeModule', { isOptional: true })
    private readonly _runtime: IRuntimeModule[],

    @inject('IRenderable') private readonly _renderer: IRenderable,
  ) {}

  public start(): void {
    const all = [...this._runtime, ...this._updatable, ...this._renderable];
    new Set(all).forEach((m) => m.init());

    this._loop();
  }

  /**
   * Внутренний анимационный цикл.
   *
   * @remarks
   * Каждый кадр:
   * 1. Обновляет модули (`update()`)
   * 2. Рендерит сцену
   * 3. Рендерит дополнительные модули (`render()`)
   * 4. Наблюдает за общим состоянием приложения, собирает метрики
   *
   * @private
   * @method
   */
  private _loop(): void {
    this._updatable.forEach((m) => m.update());

    this._renderer.render();

    this._renderable.forEach((m) => m.render());

    this._observers.forEach((m) => m.observe());

    this._animationId = requestAnimationFrame(() => this._loop());
  }

  public stop(): void {
    if (this._animationId) {
      cancelAnimationFrame(this._animationId);
      this._animationId = null;
    }
  }

  /**
   * Освобождает ресурсы контроллера.
   *
   * @public
   * @method
   */
  public dispose(): Promise<void> | void {
    this._animationId = null;
  }
}
