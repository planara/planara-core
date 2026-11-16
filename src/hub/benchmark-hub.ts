// IOC
import { type Disposable, inject, injectable } from 'tsyringe';
// Types
import {
  BenchmarkTestStatus,
  type BenchmarkConfig,
  type BenchmarkReport,
  type BenchmarkRunResult,
  type BenchmarkTestRunResult,
} from '@planara/types';
import { FeatureType } from '@/types/feature';
import type { MetricsListener } from '@/types/listener';
// Interfaces
import type { IMediator } from '@/interfaces/mediator';
import type { IMetricsStore } from '@/interfaces/store';
import type { IWorker } from '@/interfaces/worker';
// Core
import type { Renderer } from '@/core';
// Hub
import { clearBenchmarkHub } from '@/hub/index';
// Utils
import { disposeAll } from '@/shared/utils/dispose-all';
import { waitForBenchmark } from '@/shared/utils/wait-for-benchmark';

/**
 * Управляет серией benchmark-тестов и предоставляет доступ к метрикам.
 *
 * @public
 */
@injectable()
export class BenchmarkHub implements Disposable {
  /** Прерывает ожидание внутри `run()` при закрытии хаба. */
  private readonly _lifetime = new AbortController();

  /** Promise очистки ресурсов, общий для повторных вызовов `dispose()`. */
  private _disposal: Promise<void> | null = null;

  /**
   * @param _renderer - рендерер тестовой сцены
   * @param _mediator - отправка команд запуска тестов
   * @param _store - хранилище результатов и источник обновлений метрик
   * @param _worker - управление циклом рендера
   */
  public constructor(
    @inject('Renderer') private readonly _renderer: Renderer,
    @inject('IMediator') private readonly _mediator: IMediator,
    @inject('MetricsStore') private readonly _store: IMetricsStore,
    @inject('IWorker') private readonly _worker: IWorker,
  ) {}

  /**
   * Последовательно запускает тесты, перечисленные в конфигурации.
   *
   * @remarks
   * Если хаб закрывается во время ожидания, возвращает уже записанные статусы.
   * Следующие тесты серии при этом не запускаются.
   *
   * @param config - список тестов и длительность одного замера
   * @returns Результаты пройденной части серии
   * @throws {@link Error}, если освобождение ресурсов хаба уже началось
   */
  public async run(config: BenchmarkConfig): Promise<BenchmarkRunResult> {
    if (this._disposal) throw new Error('Hub has been disposed');

    this._store.clear();

    const tests: BenchmarkTestRunResult[] = [];

    for (const type of config.tests) {
      const response = this._mediator.send({
        type: FeatureType.Benchmark,
        payload: [type, config.durationMs],
      });

      // Mediator возвращает ответ синхронно. Хаб пока использует прежнюю
      // задержку между тестами, но теперь её можно прервать при закрытии.
      await waitForBenchmark(config.durationMs + 300, this._lifetime.signal);

      if (this._disposal) break;

      tests.push({
        type,
        status: response === null ? BenchmarkTestStatus.Success : BenchmarkTestStatus.Failed,
      });
    }

    return { tests };
  }

  /**
   * Возвращает отчёт по накопленным метрикам.
   *
   * @returns Отчёт из хранилища текущего хаба
   */
  public getReport(): BenchmarkReport {
    return this._store.getReport();
  }

  /**
   * Подписывает слушателя на обновления метрик.
   *
   * @param listener - обработчик обновления
   * @returns Функция отписки
   */
  public subscribeMetrics(listener: MetricsListener): () => void {
    return this._store.subscribe(listener);
  }

  /** Обновляет размеры рендера при изменении размера области просмотра. */
  public resizeRenderer(): void {
    this._renderer.resize();
  }

  /**
   * Запускает или возобновляет рендер тестовой сцены.
   *
   * @throws {@link Error}, если освобождение ресурсов хаба уже началось
   */
  public start(): void {
    if (this._disposal) throw new Error('Hub has been disposed');

    this._worker.start();
  }

  /**
   * Приостанавливает рендер тестовой сцены.
   * Таймер активного замера продолжает отсчёт.
   */
  public stop(): void {
    this._worker.stop();
  }

  /**
   * Останавливает рендер, прерывает серию и освобождает ресурсы хаба.
   *
   * @remarks
   * Хендлеры завершают свои замеры и удаляют тестовые объекты, пока сцена
   * ещё доступна. Затем освобождаются модули воркера и сам рендерер.
   *
   * @returns Promise завершения очистки. Повторный вызов возвращает тот же Promise.
   */
  public dispose(): Promise<void> {
    if (this._disposal) return this._disposal;

    this._worker.stop();
    clearBenchmarkHub(this);

    this._disposal = Promise.resolve().then(() =>
      disposeAll([this._mediator, this._worker, this._renderer]),
    );

    this._lifetime.abort();
    this._store.clear();

    return this._disposal;
  }
}
