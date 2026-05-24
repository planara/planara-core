// Types
import type { BenchmarkMetrics } from '@planara/types';
import type { MetricsListener } from '@/types/listener';

/**
 * Верхнеуровневый API для получения метрик производительности.
 *
 * @internal
 * @interface
 */
export interface IMetricsApi {
  /**
   * Запускает сбор метрик.
   *
   * @param objectsCount - количество объектов, участвующих в текущем тесте
   *
   * @internal
   */
  start(objectsCount?: number): void;

  /**
   * Останавливает сбор метрик.
   *
   * @internal
   */
  stop(): void;

  /**
   * Сбрасывает накопленные метрики.
   *
   * @internal
   */
  reset(): void;

  /**
   * Возвращает текущие или последние собранные метрики.
   *
   * @returns Метрики производительности
   *
   * @internal
   */
  getMetrics(): BenchmarkMetrics;

  /**
   * Регистрирует слушатель изменения метрик.
   *
   * @param listener - обработчик обновления метрик
   *
   * @returns Функция отписки
   *
   * @internal
   */
  subscribe(listener: MetricsListener): () => void;
}
