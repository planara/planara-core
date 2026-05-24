// Core
import * as THREE from 'three';
// Types
import { type BenchmarkTestType } from '@planara/types';
// Interfaces
import type { IBenchmarkHandler } from '@/interfaces/handler';
import type { IInteractionApi, IMetricsApi, ISceneApi } from '@/interfaces/api';
import type { IMetricsStore } from '@/interfaces/store';

/**
 * Базовый хендлер benchmark-теста.
 *
 * @remarks
 * Содержит общий жизненный цикл benchmark-сценария:
 * подготовку группы, запуск метрик, ожидание, остановку метрик
 * и очистку временных объектов.
 *
 * @internal
 * @abstract
 * @class
 */
export abstract class BaseBenchmarkHandler implements IBenchmarkHandler {
  /** Тип benchmark-теста. */
  public abstract readonly mode: BenchmarkTestType;

  /** Название группы тестовых объектов. */
  protected abstract readonly groupName: string;

  /** Количество объектов в тестовой сцене. */
  protected abstract readonly objectsCount: number;

  /** Группа объектов текущего benchmark-теста. */
  protected _group: THREE.Group | null = null;

  private _liveTimerId: number | null = null;

  protected constructor(
    protected readonly _sceneApi: ISceneApi,
    protected readonly _interactionApi: IInteractionApi,
    protected readonly _metricsApi: IMetricsApi,
    protected readonly _store: IMetricsStore,
  ) {}

  /**
   * Выполняет benchmark-тест.
   *
   * @param durationMs - длительность выполнения теста в миллисекундах
   *
   * @internal
   * @method
   */
  public async handle(durationMs: number): Promise<void> {
    // Выключение обработки пользовательского ввода
    this._interactionApi.setInteractionEnabled(false);
    // Подготовка сцены под тестирование
    this._prepareScene();

    // Запуск сборов метрик
    this._metricsApi.start(this.objectsCount);
    this._startLiveMetrics();

    // Проведение тестирования
    await this._wait(durationMs);

    // Остановка сбора метрик
    this._stopLiveMetrics();
    this._metricsApi.stop();

    // Получение метрик
    const metrics = this._metricsApi.getMetrics();

    // Сохранение метрик
    this._store.setCurrentMetrics(metrics);
    this._store.addMetrics(this.mode, metrics);

    // Включение пользовательского ввода
    this._interactionApi.setInteractionEnabled(true);
  }

  /**
   * Выполняет откат действий хендлера.
   *
   * @internal
   * @method
   */
  public rollback(): void {
    this._interactionApi.setInteractionEnabled(true);
    this._stopLiveMetrics();

    this._metricsApi.stop();
    this._metricsApi.reset();

    this._store.setCurrentMetrics(null);

    if (!this._group) return;

    this._sceneApi.removeFromScene(this._group, true);
    this._group.clear();
    this._group = null;
  }

  /** Освобождает ресурсы хендлера. */
  public dispose(): Promise<void> | void {
    this.rollback();
  }

  /**
   * Заполняет группу объектами тестовой сцены.
   *
   * @param group - группа benchmark-теста
   *
   * @internal
   * @abstract
   */
  protected abstract fillGroup(group: THREE.Group): void;

  /**
   * Подготавливает тестовую сцену.
   *
   * @private
   * @method
   */
  private _prepareScene(): void {
    const group = new THREE.Group();
    group.name = this.groupName;

    this.fillGroup(group);

    this._group = group;
    this._sceneApi.addToScene(group);
  }

  /**
   * Ожидает указанное количество миллисекунд.
   *
   * @param ms - длительность ожидания
   *
   * @returns Promise, завершающийся после указанного времени
   *
   * @private
   * @method
   */
  private _wait(ms: number): Promise<void> {
    return new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });
  }

  private _startLiveMetrics(): void {
    this._stopLiveMetrics();

    this._liveTimerId = window.setInterval(() => {
      this._store.setCurrentMetrics(this._metricsApi.getMetrics());
    }, 250);
  }

  private _stopLiveMetrics(): void {
    if (this._liveTimerId === null) return;

    window.clearInterval(this._liveTimerId);
    this._liveTimerId = null;
  }
}
