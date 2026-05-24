// IOC
import { injectable, injectAll } from 'tsyringe';
// Types
import { FeatureType } from '@/types/feature';
import { BenchmarkTestType } from '@planara/types';
// Interfaces
import type { IBenchmarkManager } from '@/interfaces/manager';
import type { IBenchmarkHandler, IHandler } from '@/interfaces/handler';

/**
 * Менеджер benchmark-тестирования.
 *
 * @remarks
 * Отвечает за выбор и запуск хендлера benchmark-теста по указанному режиму.
 * При смене режима выполняет откат предыдущего хендлера, сохраняет текущий
 * режим тестирования и передает управление соответствующему хендлеру.
 *
 * @internal
 * @class
 */
@injectable()
export class BenchmarkManager implements IBenchmarkManager {
  /** Тип фичи, за которую отвечает менеджер. */
  public readonly type: FeatureType = FeatureType.Benchmark;

  /** Текущий режим тестирования */
  private _currentMode: BenchmarkTestType = BenchmarkTestType.Light;

  /** Хендлеры, которые управляют тестированием */
  private readonly _handlers: Map<BenchmarkTestType, IHandler>;

  public constructor(@injectAll('IBenchmarkHandler') handlers: IBenchmarkHandler[]) {
    this._handlers = new Map(handlers.map((h) => [h.mode, h]));
  }

  public manage(mode: BenchmarkTestType, durationMs: number): void {
    // Чистка предыдущего режима тестирования
    this._handlers.get(this._currentMode)?.rollback();

    // Сохранение режима тестирования, для отката при выборе нового
    this._currentMode = mode;

    // Запускаем выбранный вид тестирования
    this._handlers.get(this._currentMode)?.handle(durationMs);
  }

  public dispose(): Promise<void> | void {
    // Очистка хендлеров
    if (this._handlers) {
      this._handlers.clear();
    }

    // Возвращение дефолтного значения
    this._currentMode = BenchmarkTestType.Light;
  }
}
