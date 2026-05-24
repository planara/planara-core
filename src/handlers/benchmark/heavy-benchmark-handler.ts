// Core
import * as THREE from 'three';
// IOC
import { inject, injectable } from 'tsyringe';
// Interfaces
import type { IInteractionApi, IMetricsApi, ISceneApi } from '@/interfaces/api';
import type { IMetricsStore } from '@/interfaces/store';
// Handlers
import { BaseBenchmarkHandler } from '@/handlers/benchmark';
// Types
import { BenchmarkTestType } from '@planara/types';
// Shared
import { BENCHMARK_OBJECTS_COUNT } from '@/shared/constants';

/**
 * Хендлер тяжелого benchmark-теста.
 *
 * @remarks
 * Формирует небольшую тестовую сцену из простых объектов.
 *
 * @internal
 * @class
 */
@injectable()
export class HeavyBenchmarkHandler extends BaseBenchmarkHandler {
  /** Тип benchmark-теста. */
  public readonly mode: BenchmarkTestType = BenchmarkTestType.Heavy;

  /** Название группы тестовых объектов. */
  protected readonly groupName = '__HEAVY_BENCHMARK__';

  /** Количество объектов в тестовой сцене. */
  protected readonly objectsCount = BENCHMARK_OBJECTS_COUNT;

  public constructor(
    @inject('ISceneApi') sceneApi: ISceneApi,
    @inject('IInteractionApi') interactionApi: IInteractionApi,
    @inject('IMetricsApi') metricsApi: IMetricsApi,
    @inject('MetricsStore') store: IMetricsStore,
  ) {
    super(sceneApi, interactionApi, metricsApi, store);
  }

  /**
   * Заполняет группу объектами тяжелого benchmark-теста.
   *
   * @param group - группа benchmark-теста
   *
   * @internal
   * @method
   */
  protected fillGroup(group: THREE.Group): void {
    const size = Math.ceil(Math.sqrt(this.objectsCount));
    const offset = size / 2;

    for (let i = 0; i < this.objectsCount; i += 1) {
      const x = i % size;
      const z = Math.floor(i / size);

      const geometry = new THREE.TorusKnotGeometry(0.16, 0.05, 64, 12);
      const material = new THREE.MeshStandardMaterial();

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set((x - offset) * 0.7, 0.25, (z - offset) * 0.7);

      group.add(mesh);
    }
  }
}
