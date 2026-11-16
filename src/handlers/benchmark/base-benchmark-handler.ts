// Core
import * as THREE from 'three';
// Types
import type { BenchmarkTestType } from '@planara/types';
// Interfaces
import type { IBenchmarkHandler } from '@/interfaces/handler';
import type { IInteractionApi, IMetricsApi, ISceneApi } from '@/interfaces/api';
import type { IMetricsStore } from '@/interfaces/store';
// Utils
import { waitForBenchmark } from '@/shared/utils/wait-for-benchmark';

/**
 * Базовый хендлер одного benchmark-теста.
 *
 * @remarks
 * Создаёт тестовую группу на сцене, собирает метрики в течение заданного
 * времени и сохраняет результат. Конкретный хендлер определяет состав группы.
 *
 * @internal
 */
export abstract class BaseBenchmarkHandler implements IBenchmarkHandler {
  /** Тип теста, под которым сохраняется результат замера. */
  public abstract readonly mode: BenchmarkTestType;

  /** Имя группы тестовых объектов в сцене. */
  protected abstract readonly groupName: string;

  /** Количество объектов, передаваемое в статистику замера. */
  protected abstract readonly objectsCount: number;

  /** Группа текущего теста. Удаляется со сцены при откате. */
  protected _group: THREE.Group | null = null;

  /** Контроллер ожидания текущего замера. При откате прерывает `handle()`. */
  private _waitController: AbortController | null = null;

  /** ID интервала, который публикует промежуточные метрики в store. */
  private _liveTimerId: number | null = null;

  /**
   * @param _sceneApi - управление тестовой группой на сцене
   * @param _interactionApi - управление пользовательским вводом во время замера
   * @param _metricsApi - сбор метрик рендера
   * @param _store - хранилище промежуточных и итоговых метрик
   */
  protected constructor(
    protected readonly _sceneApi: ISceneApi,
    protected readonly _interactionApi: IInteractionApi,
    protected readonly _metricsApi: IMetricsApi,
    protected readonly _store: IMetricsStore,
  ) {}

  /**
   * Подготавливает тестовую сцену и собирает метрики.
   *
   * @remarks
   * Каждый вызов получает собственный контроллер. Если во время ожидания
   * произошёл откат, этот вызов завершается до записи итоговых метрик.
   *
   * @param durationMs - длительность замера в миллисекундах
   * @returns Promise завершения или отмены замера
   */
  public async handle(durationMs: number): Promise<void> {
    this._waitController?.abort();

    const controller = new AbortController();
    this._waitController = controller;

    this._interactionApi.setInteractionEnabled(false);
    this._prepareScene();

    this._metricsApi.start(this.objectsCount);
    this._startLiveMetrics();

    await waitForBenchmark(durationMs, controller.signal);

    // После rollback() ресурсы сцены или сборщик метрик уже могли освободить.
    if (controller.signal.aborted) return;

    this._waitController = null;
    this._stopLiveMetrics();
    this._metricsApi.stop();

    const metrics = this._metricsApi.getMetrics();

    this._store.setCurrentMetrics(metrics);
    this._store.addMetrics(this.mode, metrics);

    this._interactionApi.setInteractionEnabled(true);
  }

  /**
   * Отменяет текущий замер, восстанавливает ввод и удаляет тестовую группу.
   *
   * @remarks
   * Вызывается менеджером перед переключением теста и при освобождении хендлера.
   */
  public rollback(): void {
    this._waitController?.abort();
    this._waitController = null;

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

  /** Завершает активный замер и освобождает ресурсы теста. */
  public dispose(): void {
    this.rollback();
  }

  /**
   * Наполняет группу объектами конкретного теста.
   *
   * @param group - группа, которая будет добавлена на сцену
   */
  protected abstract fillGroup(group: THREE.Group): void;

  /** Создаёт группу, наполняет её тестовыми объектами и добавляет на сцену. */
  private _prepareScene(): void {
    const group = new THREE.Group();
    group.name = this.groupName;

    this.fillGroup(group);

    this._group = group;
    this._sceneApi.addToScene(group);
  }

  /** Запускает публикацию промежуточных метрик каждые 250 мс. */
  private _startLiveMetrics(): void {
    this._stopLiveMetrics();

    this._liveTimerId = window.setInterval(() => {
      this._store.setCurrentMetrics(this._metricsApi.getMetrics());
    }, 250);
  }

  /** Останавливает публикацию промежуточных метрик. */
  private _stopLiveMetrics(): void {
    if (this._liveTimerId === null) return;

    window.clearInterval(this._liveTimerId);
    this._liveTimerId = null;
  }
}
