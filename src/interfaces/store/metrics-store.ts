// Types
import type { BenchmarkMetrics, BenchmarkReport, BenchmarkTestType } from '@planara/types';
import type { MetricsListener } from '@/types/listener';

/**
 * Хранилище метрик benchmark-тестирования.
 *
 * @public
 * @interface
 */
export interface IMetricsStore {
  /**
   * Очищает сохраненные метрики и текущие live-значения.
   *
   * @public
   */
  clear(): void;

  /**
   * Сохраняет метрики успешно выполненного benchmark-теста.
   *
   * @param type - тип benchmark-теста
   * @param metrics - собранные метрики производительности
   *
   * @public
   */
  addMetrics(type: BenchmarkTestType, metrics: BenchmarkMetrics): void;

  /**
   * Обновляет текущие live-метрики.
   *
   * @param metrics - текущие метрики производительности
   *
   * @public
   */
  setCurrentMetrics(metrics: BenchmarkMetrics | null): void;

  /**
   * Возвращает текущие live-метрики.
   *
   * @returns Текущие метрики или `null`, если измерение не выполняется
   *
   * @public
   */
  getCurrentMetrics(): BenchmarkMetrics | null;

  /**
   * Регистрирует слушатель обновления live-метрик.
   *
   * @param listener - обработчик обновления метрик
   *
   * @returns Функция отписки
   *
   * @public
   */
  subscribe(listener: MetricsListener): () => void;

  /**
   * Возвращает отчет по успешно выполненным benchmark-тестам.
   *
   * @returns Отчет benchmark-тестирования
   *
   * @public
   */
  getReport(): BenchmarkReport;
}
