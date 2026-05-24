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
// Interfaces
import type { IMediator } from '@/interfaces/mediator';
import type { IMetricsStore } from '@/interfaces/store';
import type { MetricsListener } from '@/types/listener';
import type { IWorker } from '@/interfaces/worker';
import type { Renderer } from '@/core';

/**
 * Хаб benchmark-тестирования.
 *
 * @remarks
 * Предоставляет публичный API для запуска benchmark-тестов,
 * получения итогового отчета и подписки на live-обновления метрик.
 *
 * @public
 * @class
 */
@injectable()
export class BenchmarkHub implements Disposable {
  public constructor(
    @inject('Renderer') private _renderer: Renderer,
    @inject('IMediator') private readonly _mediator: IMediator,
    @inject('MetricsStore') private readonly _store: IMetricsStore,
    @inject('IWorker') private _worker: IWorker,
  ) {}

  /**
   * Запускает benchmark-тестирование.
   *
   * @param config - конфигурация benchmark-тестирования
   *
   * @returns Краткий результат выполнения запрошенных тестов
   *
   * @public
   * @method
   */
  public run(config: BenchmarkConfig): BenchmarkRunResult {
    this._store.clear();

    const tests: BenchmarkTestRunResult[] = [];

    for (const type of config.tests) {
      const response = this._mediator.send({
        type: FeatureType.Benchmark,
        payload: [type, config.durationMs],
      });

      tests.push({
        type,
        status: response === null ? BenchmarkTestStatus.Success : BenchmarkTestStatus.Failed,
      });
    }

    return { tests };
  }

  /**
   * Возвращает отчет по успешно выполненным benchmark-тестам.
   *
   * @returns Отчет benchmark-тестирования
   *
   * @public
   * @method
   */
  public getReport(): BenchmarkReport {
    return this._store.getReport();
  }

  /**
   * Регистрирует слушатель обновления live-метрик.
   *
   * @param listener - обработчик обновления метрик
   *
   * @returns Функция отписки от обновлений
   *
   * @public
   * @method
   */
  public subscribeMetrics(listener: MetricsListener): () => void {
    return this._store.subscribe(listener);
  }

  public resizeRenderer() {
    this._renderer.resize();
  }

  /**
   * Запускает редактор.
   * Вызывается после создания хаба.
   */
  public start(): void {
    this._worker.start();
  }

  /**
   * Останавливает редактор.
   */
  public stop(): void {
    this._worker.stop();
  }

  public dispose(): Promise<void> | void {
    this._mediator.dispose();
    this._worker.dispose();
    this._store.clear();
  }
}
