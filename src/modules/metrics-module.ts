// IOC
import { inject, injectable } from 'tsyringe';
// Types
import type { BenchmarkMetrics } from '@planara/types';
import type { MetricsListener } from '@/types/listener';
// Interfaces
import type { IObserverModule } from '@/interfaces/module';
import type { IMetricsApi, IRendererInfoApi } from '@/interfaces/api';

/**
 * Модуль сбора метрик производительности runtime.
 *
 * @remarks
 * Модуль вызывается в фазе наблюдения основного цикла приложения.
 * Он не изменяет сцену и не выполняет рендеринг, а только собирает
 * показатели производительности текущего прогона.
 *
 * @internal
 * @class
 */
@injectable()
export class MetricsModule implements IObserverModule, IMetricsApi {
  /** Выполняется ли сбор метрик */
  private _isRunning = false;

  /** Время запуска сбора метрик */
  private _startedAt = 0;

  /** Время остановки сбора метрик */
  private _stoppedAt = 0;

  /** Время предыдущего кадра */
  private _lastFrameAt = 0;

  /** Количество обработанных кадров */
  private _frames = 0;

  /** Суммарное время кадров */
  private _frameTimeSum = 0;

  /** Максимальное время кадра */
  private _maxFrameTime = 0;

  /** Количество объектов в тестовой сцене */
  private _objectsCount = 0;

  /** Максимальное количество draw calls за время измерения */
  private _drawCalls = 0;

  /** Максимальное количество треугольников за время измерения */
  private _triangles = 0;

  /** Максимальное количество геометрий в памяти рендерера */
  private _geometries = 0;

  /** Максимальное количество текстур в памяти рендерера */
  private _textures = 0;

  /** Используемый объем памяти в мегабайтах */
  private _memoryUsedMb: number | undefined = undefined;

  /** Слушатели обновления метрик */
  private readonly _listeners = new Set<MetricsListener>();

  /** Время последнего уведомления слушателей */
  private _lastNotifyAt = 0;

  /** Минимальный интервал уведомлений слушателей */
  private readonly _notifyIntervalMs = 250;

  /**
   * Конструктор модуля метрик.
   *
   * @param _rendererInfoApi - доступ к информации рендерера за кадр
   *
   * @internal
   * @constructor
   */
  public constructor(
    @inject('IRendererInfoApi') private readonly _rendererInfoApi: IRendererInfoApi,
  ) {}

  /**
   * Инициализирует модуль.
   *
   * @internal
   * @method
   */
  public init(): void {
    this.reset();
  }

  /**
   * Запускает сбор метрик.
   *
   * @param objectsCount - количество объектов, участвующих в текущем тесте
   *
   * @internal
   * @method
   */
  public start(objectsCount = 0): void {
    this.reset();

    const now = performance.now();

    this._isRunning = true;
    this._startedAt = now;
    this._lastFrameAt = now;
    this._objectsCount = objectsCount;
  }

  /**
   * Останавливает сбор метрик.
   *
   * @internal
   * @method
   */
  public stop(): void {
    if (!this._isRunning) return;

    this._isRunning = false;
    this._stoppedAt = performance.now();

    this._captureRendererInfo();
    this._captureMemoryInfo();
  }

  /**
   * Сбрасывает накопленные метрики.
   *
   * @internal
   * @method
   */
  public reset(): void {
    this._isRunning = false;

    this._startedAt = 0;
    this._stoppedAt = 0;
    this._lastFrameAt = 0;

    this._frames = 0;
    this._frameTimeSum = 0;
    this._maxFrameTime = 0;

    this._objectsCount = 0;
    this._drawCalls = 0;
    this._triangles = 0;
    this._geometries = 0;
    this._textures = 0;
    this._memoryUsedMb = undefined;
    this._lastNotifyAt = 0;
  }

  /**
   * Выполняет наблюдение за текущим состоянием runtime.
   *
   * @remarks
   * Метод вызывается каждый кадр в отдельной фазе render loop.
   *
   * @internal
   * @method
   */
  public observe(): void {
    if (!this._isRunning) return;

    const now = performance.now();
    const frameTime = now - this._lastFrameAt;

    this._lastFrameAt = now;

    if (frameTime <= 0) return;

    this._frames += 1;
    this._frameTimeSum += frameTime;
    this._maxFrameTime = Math.max(this._maxFrameTime, frameTime);

    this._captureRendererInfo();
    this._captureMemoryInfo();
    this._notify();
  }

  /**
   * Возвращает текущие или последние собранные метрики.
   *
   * @returns Метрики производительности
   *
   * @internal
   * @method
   */
  public getMetrics(): BenchmarkMetrics {
    const durationMs = this._getDurationMs();
    const averageFrameTime = this._frames > 0 ? this._frameTimeSum / this._frames : 0;

    const metrics: BenchmarkMetrics = {
      durationMs,
      frames: this._frames,

      averageFps: averageFrameTime > 0 ? 1000 / averageFrameTime : 0,
      minFps: this._maxFrameTime > 0 ? 1000 / this._maxFrameTime : 0,

      averageFrameTime,
      maxFrameTime: this._maxFrameTime,

      objectsCount: this._objectsCount,
      drawCalls: this._drawCalls,
      triangles: this._triangles,
      geometries: this._geometries,
      textures: this._textures,
    };

    if (this._memoryUsedMb !== undefined) {
      metrics.memoryUsedMb = this._memoryUsedMb;
    }

    return metrics;
  }

  /**
   * Регистрирует слушатель изменения метрик.
   *
   * @param listener - обработчик обновления метрик
   *
   * @returns Функция отписки
   *
   * @internal
   */
  public subscribe(listener: MetricsListener): () => void {
    this._listeners.add(listener);

    return () => {
      this._listeners.delete(listener);
    };
  }

  /**
   * Освобождает ресурсы модуля.
   *
   * @internal
   * @method
   */
  public dispose(): Promise<void> | void {
    this.reset();
  }

  /**
   * Возвращает фактическую длительность сбора метрик.
   *
   * @returns Длительность измерения в миллисекундах
   *
   * @private
   * @method
   */
  private _getDurationMs(): number {
    if (!this._startedAt) return 0;

    const end = this._isRunning ? performance.now() : this._stoppedAt;

    return Math.max(0, end - this._startedAt);
  }

  /**
   * Сохраняет статистику WebGL-рендерера.
   *
   * @private
   * @method
   */
  private _captureRendererInfo(): void {
    const info = this._rendererInfoApi.getRendererInfo();

    this._drawCalls = Math.max(this._drawCalls, info.drawCalls);
    this._triangles = Math.max(this._triangles, info.triangles);
    this._geometries = Math.max(this._geometries, info.geometries);
    this._textures = Math.max(this._textures, info.textures);
  }

  /**
   * Сохраняет информацию об используемой памяти, если она доступна.
   *
   * @private
   * @method
   */
  private _captureMemoryInfo(): void {
    const memory = (
      performance as Performance & {
        memory?: {
          usedJSHeapSize: number;
        };
      }
    ).memory;

    if (!memory) return;

    this._memoryUsedMb = memory.usedJSHeapSize / 1024 / 1024;
  }

  /**
   * Уведомляет слушателей об обновлении метрик.
   *
   * @private
   * @method
   */
  private _notify(): void {
    if (this._listeners.size === 0) return;

    const now = performance.now();

    if (now - this._lastNotifyAt < this._notifyIntervalMs) return;

    this._lastNotifyAt = now;

    const metrics = this.getMetrics();

    this._listeners.forEach((listener) => listener(metrics));
  }
}
