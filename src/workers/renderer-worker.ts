// IOC
import { inject, injectable, injectAll } from 'tsyringe';
// Interfaces
import type { IWorker } from '@/interfaces/worker';
import type { IRenderable } from '@/interfaces/api/renderer';
import type {
  IObserverModule,
  IRenderableModule,
  IRuntimeModule,
  IUpdatableModule,
} from '@/interfaces/module';
// Utils
import { disposeAll } from '@/shared/utils';
// Types
import { WorkerState } from '@/types/worker';

/**
 * Управляет инициализацией модулей и циклом рендера одного экземпляра редактора.
 *
 * @remarks
 * Первый запуск инициализирует модули. После паузы воркер продолжает рендер
 * с теми же экземплярами. При уничтожении останавливает кадры и освобождает модули.
 *
 * @internal
 */
@injectable()
export class RendererWorker implements IWorker {
  /** Текущее состояние жизненного цикла воркера. */
  private _state: WorkerState = WorkerState.New;

  /** ID ожидающего кадра. Сбрасывается при входе в callback или после отмены кадра. */
  private _animationId: number | null = null;

  /**
   * Номер запуска, которому принадлежит выполняемый кадр.
   *
   * @remarks
   * Изменяется при запуске и остановке. Если модуль вызывает `stop()` из `update()`,
   * текущий callback уже исполняется. По изменившемуся номеру он определяет,
   * что должен завершиться до рендера или планирования следующего кадра.
   */
  private _run = 0;

  /**
   * Модули в порядке инициализации.
   *
   * Один экземпляр может выполнять несколько ролей. В этой коллекции он
   * представлен один раз, чтобы получить по одному вызову `init()` и `dispose()`.
   */
  private readonly _modules: IRuntimeModule[];

  /**
   * @param _updatable - модули, обновляемые перед рендером сцены
   * @param _renderable - модули, рисующие дополнительные элементы поверх сцены
   * @param _observers - модули, получающие управление после рендера
   * @param runtime - модули, зарегистрированные для инициализации и освобождения
   * @param _renderer - рендерер основной сцены
   */
  public constructor(
    @injectAll('IUpdatableModule', { isOptional: true })
    private readonly _updatable: IUpdatableModule[],

    @injectAll('IRenderableModule', { isOptional: true })
    private readonly _renderable: IRenderableModule[],

    @injectAll('IObserverModule', { isOptional: true })
    private readonly _observers: IObserverModule[],

    @injectAll('IRuntimeModule', { isOptional: true })
    runtime: IRuntimeModule[],

    @inject('IRenderable')
    private readonly _renderer: IRenderable,
  ) {
    this._modules = [...new Set([...runtime, ..._updatable, ..._renderable, ..._observers])];
  }

  /**
   * Запускает рендер или возобновляет его после паузы.
   *
   * @remarks
   * При первом запуске вызывает `init()` у модулей и синхронно выполняет первый кадр.
   * Повторный вызов во время инициализации или рендера не создаёт второй цикл.
   *
   * @throws {@link Error}, если воркер уничтожен или предыдущая инициализация завершилась ошибкой
   */
  public start(): void {
    if (this._state === WorkerState.Failed || this._state === WorkerState.Disposed)
      throw new Error('Cannot restart a failed or disposed renderer worker');

    // Воркер уже запущен, либо запускается
    if (this._state === WorkerState.Running || this._state === WorkerState.Initializing) return;

    if (this._state === WorkerState.New) {
      this._state = WorkerState.Initializing;

      try {
        for (const module of this._modules) {
          module.init();
          if (this._state !== WorkerState.Initializing) return;
        }
      } catch (error) {
        this._state = WorkerState.Failed;
        throw error;
      }
    }

    this._state = WorkerState.Running;
    this._frame(++this._run);
  }

  /**
   * Приостанавливает активный цикл и отменяет ожидающий кадр.
   *
   * @remarks
   * Модули сохраняют своё состояние и подписки. Следующий `start()` возобновит
   * работу без повторного вызова `init()`.
   */
  public stop(): void {
    if (this._state !== WorkerState.Running) return;

    this._state = WorkerState.Paused;
    ++this._run;

    if (this._animationId !== null) {
      cancelAnimationFrame(this._animationId);
      this._animationId = null;
    }
  }

  /**
   * Останавливает цикл и освобождает модули в обратном порядке их регистрации
   * в коллекции инициализации.
   *
   * @returns При первом вызове — Promise завершения очистки.
   * Повторный вызов возвращает `void`.
   */
  public dispose(): Promise<void> | void {
    if (this._state === WorkerState.Disposed) return;

    this.stop();
    this._state = WorkerState.Disposed;

    return disposeAll([...this._modules].reverse());
  }

  /**
   * Обновляет модули, рисует сцену и оверлеи, затем уведомляет наблюдателей.
   *
   * @remarks
   * После передачи управления модулю проверяет номер запуска. Это позволяет
   * завершить старый кадр, даже если модуль успел остановить и снова запустить воркер.
   *
   * @param run - номер запуска, запланировавшего этот кадр
   */
  private _frame(run: number): void {
    if (run !== this._run) return;

    this._animationId = null;

    try {
      for (const module of this._updatable) {
        module.update();
        if (run !== this._run) return;
      }

      this._renderer.render();
      if (run !== this._run) return;

      for (const module of this._renderable) {
        module.render();
        if (run !== this._run) return;
      }

      for (const module of this._observers) {
        module.observe();
        if (run !== this._run) return;
      }

      this._animationId = requestAnimationFrame(() => this._frame(run));
    } catch (error) {
      if (run === this._run) this.stop();
      throw error;
    }
  }
}
