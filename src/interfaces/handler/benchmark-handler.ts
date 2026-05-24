// Interfaces
import type { IHandler } from './handler';
// Types
import type { BenchmarkTestType } from '@planara/types';

/**
 * Маркерный интерфейс для всех Benchmark-хендлеров.
 * Используется только для DI.
 *
 * @remarks
 * Расширяет {@link IHandler} и добавляет поле `mode`
 *
 * @internal
 * @interface
 */
export interface IBenchmarkHandler extends IHandler {
  /**
   * Режим тестирования, за который отвечает хендлер.
   *
   * @internal
   * @member
   */
  mode: BenchmarkTestType;
}
