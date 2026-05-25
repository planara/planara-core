// IOC
import { injectable } from 'tsyringe';
// Store
import { makeAutoObservable } from 'mobx';
// Types
import {
  BenchmarkTestStatus,
  type BenchmarkMetrics,
  type BenchmarkReport,
  type BenchmarkTestReport,
  type BenchmarkTestType,
} from '@planara/types';
import type { MetricsListener } from '@/types/listener';
// Interfaces
import type { IMetricsStore } from '@/interfaces/store';

/**
 * Store метрик benchmark-тестирования.
 *
 * @remarks
 * Хранит успешные результаты benchmark-тестов и текущие live-метрики.
 * Ошибки тестов не сохраняются в store, так как обрабатываются через middleware
 * и возвращаются в виде response при запуске теста.
 *
 * @public
 * @class
 */
@injectable()
export class MetricsStore implements IMetricsStore {
  /** Дата создания текущего отчета. */
  private _createdAt = new Date().toISOString();

  /** Отчеты успешно выполненных тестов. */
  private _tests: BenchmarkTestReport[] = [];

  /** Текущие live-метрики. */
  private _currentMetrics: BenchmarkMetrics | null = null;

  /** Слушатели обновления live-метрик. */
  private readonly _listeners = new Set<MetricsListener>();

  public constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  public clear(): void {
    this._createdAt = new Date().toISOString();
    this._tests = [];
    this.setCurrentMetrics(null);
  }

  public addMetrics(type: BenchmarkTestType, metrics: BenchmarkMetrics): void {
    this._tests.push({
      type,
      status: BenchmarkTestStatus.Success,
      metrics,
    });
  }

  public setCurrentMetrics(metrics: BenchmarkMetrics | null): void {
    this._currentMetrics = metrics;

    for (const listener of this._listeners) {
      listener(this._currentMetrics);
    }
  }

  public getCurrentMetrics(): BenchmarkMetrics | null {
    return this._currentMetrics;
  }

  public subscribe(listener: MetricsListener): () => void {
    this._listeners.add(listener);

    return () => {
      this._listeners.delete(listener);
    };
  }

  public getReport(): BenchmarkReport {
    return {
      createdAt: this._createdAt,
      tests: [...this._tests],
    };
  }
}
